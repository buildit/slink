# Slink Project #
_Slink_ is a SmartRecruiters to SAP integration service.  It is implemented using AWS Lambda, using the Javascript/Node "flavor", and is built and deployed using AWS' CodeStar CI/CD product.

```
                         +--------------------+
                         |  CloudWatch Event  |
                         +---------+----------+
                                   |
+------------------+               |
| SSM Param Store  <---------+     |  Scheduled Trigger
+------------------+         |     |
                             |     |
                             |     |
+-----------------+   GET   ++-----v------+    POST    +---------+
| SmartRecruiters <---------+    Lambda   +------------>   SAP   |
+-----------------+         +------+------+            +---------+
                                   |
                                   |
                                   |
                            +------v------+
                            |   DynamoDB  |
                            +-------------+
                         (State/Medata/Stats)


```

A scheduled CloudWatch Event triggers the Lambda function, which queries SmartRecruiters for candidates in certain 
states, converts them to "applicants", and then posts them to SAP, to either "introduce" them to SAP, or to "activate" 
them in SAP.  Private/secret configuration data is obtained from Amazon's SSM Param Store.  Minimal data about the 
runs, introductions, and activations is (intended to be) stored in DynamoDB.


# Building and Deploying #

## Dependencies ##
- Node 8.10+ / NPM 5.6.0+
- It is highly recommended to use `nvm` [https://github.com/creationix/nvm]


## Building Locally ##
- Clone this repository
- `nvm use`
- `npm install`
- `npm test -- --silent` (silent causes `console.log()` messages not to print, giving cleaner output)

_Note_:  The solution was intended to be modular.  That is, there are can be several "module" subdirectories within 
the source tree (though there is currently only one).  Each module is meant to represent a Lambda function and has 
its own `package.json`.  We were striving to keep the commands the same within a given module as within the project 
root.  However, since `npm` does not support hierarchical project structures in the same way as say Java's Maven or 
Gradle, when in doubt, run `npm` commands from within the module you're working with first, since that's what is 
actually built by the CI/CD pipeline.


## Running Lambda Functions Locally via "SAM Local" ##
There is a CodeStar-managed CodePipeline in AWS that runs tests and deploys the function(s) in this package.  But what 
if you want to run/test locally?

#### To Work with AWS from the command-line
- [Install and configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) 
  (us-east-1 is recommended for your default region, at least for this project) 
- Test your installation:
    ```bash
    ❯ aws codestar list-projects
    {
        "projects": [
            {
                "projectId": "buildit-slink",
                "projectArn": "arn:aws:codestar:us-east-1:006393696278:project/buildit-slink"
            }
        ]
    }
    ```

#### To Execute Lambda Functions
- Install and run Docker

- [Install the SAM CLI](https://github.com/awslabs/aws-sam-cli#installation)

- _Take special note of the requirement to add your project root directory to Docker's File Sharing preferences_

#### To have a Local DynamoDb
- [Download local DynamoDb](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- Start local DynamoDb using Amazon's instructions
- Run `./bin/create-local-tables.sh`
- Map an IP so that the Lambda container can see the Dynamo instance (`localhost` won't work): 

  `sudo ifconfig lo0 alias <some IP for Dynamo>` (I use `10.1.1.22`)
  
  undo with
  
  `ifconfig lo0 -alias <some IP for Dynamo>`
  
- You should be able to do the following after these steps:
    ```
    ❯ aws dynamodb list-tables --endpoint-url http://<some IP for Dynamo>:8000
    {
        "TableNames": [
            "Activations",
            "Introductions",
            "LastRunDate",
            "Runs"
        ]
    }
    ```
    

#### To run the Lambda
See [AWS docs](https://github.com/awslabs/aws-sam-cli#invoke-functions-locally).

Adding up all the above, the command to run locally is:

```$bash
LOCAL_DYNAMO_IP=10.1.1.22 \
LAST_RUN_DATE_TABLE=LastRunDate \
RUNS_TABLE=Runs \
INTRODUCTIONS_TABLE=Introductions \
ACTIVATIONS_TABLE=Activations \
sam local invoke SlinkMainFunction -e event.json
```

_**Note**_: Runtime configuration settings and secrets are manually managed in AWS Parameter Store. There are two sets of 
configuration settings for STAGE and PROD environments. When running locally via SAM local, the code automatically 
uses the STAGE configuration. The parameters are managed under the `/slink` path in AWS Parameter Store, as follows:

Pattern:
`/slink/[environment]/grouping/name`

Example:
`/slink/STAGE/smartrecruiters/EMPLOYEE_PROP_ID`

#### Troubleshooting
If you get a `Requested resource not found` error, then you probably screwed up your local DynamoDb setup.


## AWS Deployment ##
The code is automatically built and deployed by CodeStar when code is committed to `master`.  Currently, branches
are not built by the CI/CD system.

Please see the [CodeStar Dashboard](https://console.aws.amazon.com/codestar/home?region=us-east-1#/projects/buildit-slink/dashboard) 
to check deployment status.  
Contact a team member, if you don't have access.

## Lambda "Environments" and Promotions ##

### Environments ###
Lambda doesn't support environments per-se.  Instead, Amazon maintains a linear version history of a given Lambda's 
code, and uses ["aliases"] (https://docs.aws.amazon.com/lambda/latest/dg/versioning-aliases.html) to tag versions.  
Amazon maintains an alias called `$LATEST` that is automatically moved to a new version.  However, developers can
create and use any number of aliases and then use the alias(es) to execute a given version of a Lambda.

Specifically for Slink, there is a `STAGE` alias that is automatically moved to the latest version of the function 
on each successful build.  `STAGE` always corresponds to the `$LATEST` automatic alias.

There is a separate, _manually maintained_ alias called `PROD`.  The reason the `PROD` alias 
is moved manually is to allow for controlled promotion of the Lambda once it is proven out in staging.

Note that the `PROD` alias is executed by the scheduled CloudWatch Event.  The `STAGE` alias can only be executed
using the Lambda's URL or in the Lambda console:

`https://<see codestart project page>/Stage/slink`


## Trivia and Gotchas ##

#### Not all DynamoDB tables have code to populate them

###### Activations Table
In the introduction process a new candidate is added to the SAP HR system, and an employee ID is handed back.  That
employee ID is then stored (PUT) in a SmartRecruiters custom property.  We don't want to introduce a given candidate more
than once.  A trick that we used to avoid re-introducing a candidate, without using DynamoDB, was to include the 
candidate employee ID property when building an applicant.  Then, we just skip those applicants that already have 
an employee ID.  Obviously, this could have been achieved by storing in DynamoDB but the original approach a) fulfilled
the requirement to store the employee ID in SmartRecruiters, and b) didn't need DynamoDB to actually work (we wrote
this feature before adding DynamoDB to the mix of tech). 

###### Runs Table
The idea of the `Run` table was to capture statistics about a given run (basically stuff you see in the function's 
response).  One could imagine a simple API that would scan the run table and return to a CLI or web client.  We never 
got to it, but decided to leave the table definition in place so at least the idea was captured.  There's no cost
(that I know of) for an unwritten/read DynamoDB table.  

#### Log messages are not separated by alias
AWS doesn't magically write the function alias into log records that appear in CloudWatch logs.  Therefore, it's 
difficult to be sure which alias' messages you're looking at.  We do write a log as the process starts, which looks
something like this:
```
2018-07-18T15:52:51.979Z	a04d0fd9-8aa2-11e8-9030-ad46d7b7496e	#### Function ARN: arn:aws:lambda:us-east-1:000000000000:function:awscodestar-xxx-xxx-xxx-SlinkMainFunction-XXXXXXXX:STAGE 
```
It will be followed by the logs for that run, but there's nothing to prevent logs from being intermingled if another
invocation occurs.  There is a card to address this, but we never got to it.
 
#### CodeStar is an odd beast
CodeStar is basically a wizard that creates a repo, and a CI/CD pipeline pointing to that repo on your behalf.  It 
magically starts building the code in your repo and deploying it.  However, it occupies kind-of an "uncanny valley" 
of automation.  If you wanted to move the project to a different region for some reason, that won't be straightforward:  
you can't just grab the CI/CD CloudFormation template and run it as-is, because it contains a CodeStar resource that 
can't actually be created from CloudFormation (yeah, you will get an error message if you try). 

That aside, there are some ways to have CodeStar point to a different repo than the one it originally created.
If you act as though you want to do an update on the CI/CD CloudFormation stack created by CodeStar, you'll see that
a couple of parameters refer to repository details (URL and token, at least).

#### The Code in the project is not what CodeStar wanted us to have
CodeStar created our Lambda/Node project using _Express_ for some reason, rather than just a handler method, as with
traditional Lambda/Javascript functions.  We converted it to just use `index.js::handler methods`.  Express seemed 
like an additional level of indirection and complication that was not needed.


#### Handy Local DynamoDB commands
`aws dynamodb list-tables --endpoint-url http://localhost:8000`

`aws dynamodb scan --table-name Activations --endpoint-url http://localhost:8000 --output text`

`aws dynamodb delete-table --table-name Activations --endpoint-url http://localhost:8000`

Note that you can delete a single table and then re-run the create script.  It will error out on the tables that
are still present, but create any missing ones.

## Team Practices ##
See (Contributing)[./CONTRIBUTING.md]


# Original CodeStar Content    
<details>
<summary>
  Click for more ...
</summary>

This sample code helps get you started with a simple Express web service
deployed by AWS CloudFormation to AWS Lambda and Amazon API Gateway.

What's Here
-----------

This sample includes:

* README.md - this file
* buildspec.yml - this file is used by AWS CodeBuild to package your
  service for deployment to AWS Lambda
* app.js - this file contains the sample Node.js code for the web service
* index.js - this file contains the AWS Lambda handler code
* template.yml - this file contains the AWS Serverless Application Model (AWS SAM) used
  by AWS CloudFormation to deploy your service to AWS Lambda and Amazon API
  Gateway.
* tests/ - this directory contains unit tests for your application


What Do I Do Next?
------------------

If you have checked out a local copy of your repository you can start making
changes to the sample code.  We suggest making a small change to app.js first,
so you can see how changes pushed to your project's repository are automatically
picked up by your project pipeline and deployed to AWS Lambda and Amazon API Gateway.
(You can watch the pipeline progress on your AWS CodeStar project dashboard.)
Once you've seen how that works, start developing your own code, and have fun!

To run your tests locally, go to the root directory of the
sample code and run the `npm test` command, which
AWS CodeBuild also runs through your `buildspec.yml` file.

To test your new code during the release process, modify the existing tests or
add tests to the tests directory. AWS CodeBuild will run the tests during the
build stage of your project pipeline. You can find the test results
in the AWS CodeBuild console.

Learn more about AWS CodeBuild and how it builds and tests your application here:
https://docs.aws.amazon.com/codebuild/latest/userguide/concepts.html

Learn more about AWS Serverless Application Model (AWS SAM) and how it works here:
https://github.com/awslabs/serverless-application-model/blob/master/HOWTO.md

AWS Lambda Developer Guide:
http://docs.aws.amazon.com/lambda/latest/dg/deploying-lambda-apps.html

Learn more about AWS CodeStar by reading the user guide, and post questions and
comments about AWS CodeStar on our forum.

User Guide: http://docs.aws.amazon.com/codestar/latest/userguide/welcome.html

Forum: https://forums.aws.amazon.com/forum.jspa?forumID=248

What Should I Do Before Running My Project in Production?
------------------

AWS recommends you review the security best practices recommended by the framework
author of your selected sample application before running it in production. You
should also regularly review and apply any available patches or associated security
advisories for dependencies used within your application.

Best Practices: https://docs.aws.amazon.com/codestar/latest/userguide/best-practices.html?icmpid=docs_acs_rm_sec
</details>

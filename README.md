# Slink Project #
_Slink_ is a SmartRecruiters to SAP integration service.  It is implemented using AWS Lambda, using the Javascript/Node "flavor", and is built and deployed using AWS' CodeStar CI/CD product.

# Building and Deploying #

## Dependencies ##
- Node 8.10+ / NPM 5.6.0+
- It is highly recommended to use `nvm` [https://github.com/creationix/nvm]

## Building Locally ##
- Clone this repository
- `nvm use`
- `npm install`
- `npm test -- --silent` (silent causes `console.log()` messages not to print, giving cleaner output)

_Note_:  The solution is modular.  That is, there are several "module" subdirectories within the source tree.  Each
module represents a Lambda function and has its own `package.json`.  We are striving to keep the commands the same
within a given module as within the project root.  However, since `npm` does not support hierarchical project structures
in the same way as say Java's Maven or Gradle, when in doubt, run `npm` commands from within the module you're
working with first, since that's what is actually built by the CI/CD pipeline.

## Running Lambda Functions Locally via "SAM Local" ##
There is a CodeStar-managed CodePipeline in AWS that runs tests and deploys the function(s) in this package.  But what if you want to run/test locally?

Follow these steps:
- Install and run Docker
- Install the SAM CLI:  https://github.com/awslabs/aws-sam-cli#installation
- Take special note of the requirement to add your project root directory to Docker's File Sharing preferences
- Run the appropriate `sam local invoke` command.  See https://github.com/awslabs/aws-sam-cli#invoke-functions-locally

### Example terminal session for `ping` function:
```bash
1 ❯ sam local invoke "PingFunction"
2018-05-21 16:48:58 Reading invoke payload from stdin (you can also pass it from file with --event)
{}
<ctl-D>
2018-05-21 16:49:03 Invoking index.handler (nodejs8.10)
2018-05-21 16:49:03 Credentials found in config file: ~/.aws/config

Fetching lambci/lambda:nodejs8.10 Docker container image......
2018-05-21 16:49:05 Mounting /Users/mthomas/Code/slink/ping as /var/task:ro inside runtime container
START RequestId: 52325f23-d66b-1713-6604-05d453ab9d80 Version: $LATEST
END RequestId: 52325f23-d66b-1713-6604-05d453ab9d80
REPORT RequestId: 52325f23-d66b-1713-6604-05d453ab9d80    Duration: 725.14 ms    Billed Duration: 800 ms    Memory Size: 128 MB    Max Memory Used: 35 MB

{"statusCode":200,"body":"{\"message\":\"hello world\",\"location\":\"208.184.53.154\"}"}
```

### Example command for `slink-main` function, passing in Lambda environment variable:

`SR_API_TOKEN=<value> SAP_USERNAME=<value> SAP_PASSWORD=<value> sam local invoke SlinkMainFunction -e event.json`


## AWS Deployment ##
The code is automatically built and deployed by CodeStar when code is committed to `master`.  Currently, branches
are not built by the CI/CD system.

Please see the [CodeStar Dashboard](http://tinyurl.com/yc4ymbrm) to check deployment status.  
Contact a team member, if you don't have access.

## Team Practices ##
- We track work using Github issues and the [project board](https://github.com/buildit/slink/projects/1).
- We use trunk-based development using `master` as "trunk".  
- We encourage the use of _short-lived_ Feature Branches followed by Pull Requests (PRs).
- PR author performs the merge, and we prefer at least one approval from a PR reviewer before merge.
- We encourage Github "squash merges" for branches with messy commits. 
- Minor fixes/doc changes, etc, can go straight to `master`.

---

# AWS CodeStar Stuff #

Welcome to the AWS CodeStar sample web service
==============================================

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

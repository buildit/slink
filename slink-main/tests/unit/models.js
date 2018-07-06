'use strict';

//
// This is the applicant model which we will create and use in our application
//
const applicant = {
  id: 'cc285818-963d-497a-a2a8-e2227af0876e',
  employeeId: null, // case if applicant is un-introduced
  firstName: 'Ricky',
  lastName: 'Bobby',
  email: 'shakenbake@gmail.com',
  location: {
    country: 'United States',
    city: 'Atlanta',
  },
  fullTime: true,
  primaryAssignment: {
    job: {
      id: 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
      startDate: '2018-06-22T18:00:00.000Z',
      zipCode: '30126',
      country: 'us',
      annualSalary: 100000,
      annualBonus: 10000,
      offeredCurrency: 'USD',
      signingBonus: 12345
    },
  },
  phoneNumber: '4101234567',
  experience: {
    location: 'Atlanta, GA'
  }
};


const sr = {};

// This is sample raw candidate summary returned by SR
sr.rawCandidateSummaries = {
  data: {
    content: [
      {
        id: 'cc285818-963d-497a-a2a8-e2227af0876e',
        internal: false,
        firstName: 'Ricky',
        lastName: 'Bobby',
        email: 'shakenbake@gmail.com',
        location: {
          country: 'United States',
          city: 'Atlanta',
          region: 'Georgia',
          lat: 33.748997,
          lng: -84.387985
        },
        createdOn: '2018-06-08T04:55:28.000Z',
        updatedOn: '2018-06-08T17:20:29.000Z',
        primaryAssignment: {
          job: {
            id: 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
            title: 'Front End Engineer',
            actions: {
              details: {
                url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
                method: 'GET'
              }
            }
          },
          status: 'OFFERED',
          subStatus: 'Offer Accepted'
        },
        actions: {
          details: {
            url: 'https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e',
            method: 'GET'
          },
          properties: {
            url: 'https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/properties',
            method: 'GET'
          }
        }
      }
    ]
  }
};

// This is sample raw candidate details returned by SR
sr.candidateDetail = {
  data: {
    id: 'cc285818-963d-497a-a2a8-e2227af0876e',
    internal: false,
    firstName: 'Ricky',
    lastName: 'Bobby',
    email: 'shakenbake@gmail.com',
    phoneNumber: '4101234567',
    location: {
      countryCode: 'us',
      country: 'United States',
      city: 'Atlanta',
      region: 'Georgia',
      lat: 33.748997,
      lng: -84.387985
    },
    createdOn: '2018-06-08T04:55:28.000Z',
    updatedOn: '2018-06-08T17:20:29.000Z',
    experience: [
      {
        title: 'Janitor',
        company: 'Nascar',
        current: true,
        location: 'Atlanta, GA',
        startDate: '2018-02-01',
        endDate: '2018-03-01'
      }
    ],
    actions: {
      properties: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/properties'
      },
      attachments: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/attachments'
      }
    },
    primaryAssignment: {
      job: {
        id: 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
        title: 'Front End Engineer',
        actions: {
          details: {
            url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
            method: 'GET'
          }
        }
      },
      status: 'OFFERED',
      subStatus: 'Offer Accepted',
      source: 'Referred by Chris Mundt',
      actions: {
        sourceDetails: {
          url: 'https://api.smartrecruiters.com/configuration/sources/REFERRALS/values/5ab3cc08e4b048f3bdecb880',
          method: 'GET'
        }
      }
    }
  }
};

sr.jobDetail = {
  data: {
    id: 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c',
    title: 'Front End Engineer',
    refNumber: 'REF63Q',
    status: 'OFFER',
    createdOn: '2017-03-14T17:42:51.000Z',
    lastActivityOn: '2018-06-13T21:54:23.318Z',
    department: {
      id: '921917',
      label: 'Buildit Front End Engineering'
    },
    location: {
      countryCode: 'us',
      country: 'United States',
      region: 'Colorado',
      city: 'Denver',
      regionCode: 'CO'
    },
    actions: {
      details: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c'
      },
      hiringTeam: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/hiring-team'
      },
      publications: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/publication?active=true'
      },
      positions: {
        method: 'GET',
        url: 'https://api.smartrecruiters.com/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/positions'
      },
      applyOnWeb: {
        method: 'GET',
        url: 'https://www.smartrecruiters.com/WiproDigital/743999671191275-front-end-engineer?oga=true'
      }
    },
    creator: {
      id: '5889cc6ee4b0215f3c7367d3',
      firstName: 'Rodney',
      lastName: 'Callaghan'
    },
    updatedOn: '2018-06-08T05:04:50.000Z',
    postingStatus: 'PUBLIC',
    industry: {
      id: 'it_and_services',
      label: 'Information Technology And Services'
    },
    function: {
      id: 'information_technology',
      label: 'Information Technology'
    },
    typeOfEmployment: {
      id: 'permanent',
      label: 'Full-time'
    },
    experienceLevel: {
      id: 'mid_senior_level',
      label: 'Mid-Senior Level'
    },
    eeoCategory: {
      id: 'professionals',
      label: 'Professionals'
    },
    template: false,
    jobAd: {
      sections: {
        companyDescription: {
          title: 'Company Description',
          text: '<p><strong>Buildit @ Wipro Digital</strong> is a Global Engineering Studio and part of Wipro Digital and the wider Wipro Organisation. We’re a global team and we value transparency, curiosity, inclusivity and getting stuff done. Doing things differently requires strength of character, empathy for those around you, good judgement, as well as being able to explain why to do something differently in the customer&apos;s language and at the right time.  This requires not just being able to do what good looks like but to stand in the middle of something not good and influence the outcome incrementally day to day to make it better.</p><p><strong>Why us?</strong></p><p>Our people are at the core of this process. Trust in our people underpins everything we do. Talented, passionate, hard-working, and some of the sharpest people you will ever meet.  The best thing about working here is the people you get to work with while solving hard problems.</p>'
        },
        jobDescription: {
          title: 'Job Description',
          text: '<p><strong>Who we are looking for</strong></p><p>We are looking for people who have a grasp of a variety of technologies, languages, and methodologies, along with their pros and cons; who are pragmatic, behave like grown-ups, and know when and how to say ‘no’.</p><p>Our approach is grounded in lean and agile ways of working, and includes engineering practices such as automated unit and functional testing, and CI &amp; CD. These things are deeply important to us, and they need to be equally important to you - we can’t emphasize this enough.</p><p><strong>Please, note that this role requires up to 80% travel within the US.</strong></p><p><strong>What you&apos;ll do</strong></p><ul><li>Understand clients’ organizations, aspirations and challenges.</li><li>Enable our clients to adapt to changing needs, by delivering better software faster and more often.</li><li>Build real solutions through experimentation as part of a multi-faceted team.</li><li>Explore up-and-coming technologies and software products.</li><li>Read; experiment; learn; teach.</li></ul>'
        },
        qualifications: {
          title: 'Qualifications',
          text: '<p><strong>Skills and experience we’re after: </strong></p><ul><li>You have extensive front end engineering experience, both with and without frameworks.</li><li>You write automated tests (unit, functional, integration, system, TDD, BDD) - this is especially important to us, to the point of being a deal-breaker.</li><li>You want to build and work in autonomous, cross-functional delivery teams.</li><li>You have solid JavaScript (ES6 onwards, TypeScript, JQuery) experience.</li><li>Node.js experience would be a nice-to-have.</li><li>You like working with modern SPA frameworks (React, Angular 2/4, Ember, etc).</li><li>You have solid templating (Handlebars, Mustache, etc) experience.</li><li>You have solid CSS (SASS, Less, SMACSS, BEM) experience.</li><li>You use build managers (Grunt, Gulp, Webpack).</li><li>You use package managers (NPM, Yarn, Bower, Browserify).</li><li>You are familiar with modern design principles (offline first, mobile first, responsive, adaptive, progress enhancements, living style guides, atomic design).</li></ul>'
        },
        additionalInformation: {
          title: 'Additional Information',
          text: '<p>If the above sounds like something you&apos;re currently doing, something you believe you can do, or even something you would like to do, get in touch with us and let&apos;s have a chat.</p><p><strong>The hiring process</strong></p><p>We want to have a simple process that will allow both us and you to bring out the best of all parties. We want to make sure that we are right for you as much as the other way around. The typical hiring process is as follows.</p><p><strong>Stage 0: </strong><strong>Let&apos;s chat</strong></p><p>One of the Buildit talent team will call you for a quick chat to find out a little bit about you. For some roles we would ask you to complete an exercise after but we will let you know at this stage for sure!</p><p><strong>Stage 1: Let&apos;s chat</strong></p><p>A chat on the phone or a video call with one of the Buildit studio team, where we talk a bit about us and how your experiences can help us. For some roles we would invite you to the Studio to meet face to face, we would also welcome you at the studio if this would be your preference.</p><p><strong>Stage 2: Exercise</strong><strong> </strong><strong>-</strong><strong>  this stage is for Technical Roles</strong></p><p>Here we would like to see a little bit of your tech and coding skills. We will send you the details for the exercise, so that you can show us some awesome code. Your solution will be used in the next stage to build upon during a pairing session with a couple of our engineers.</p><p><strong>Stage 3: Meet the team</strong></p><p>This involves a visit to one of our studios, where you get to meet a few of the team if haven&apos;t done so in the process. We&apos;ll get to talk in more detail about what we do, your experiences and ambitions. If you are an Engineer we will also spend a bit of time talking about your tech submission and we will pair program building a few more features.</p><p><strong>Stage 4: That&apos;s it</strong></p><p>That&apos;s pretty much it. There will be one more phone call to confirm transfer details with you, and possible start dates. <strong>Welcome to Buildit @ Wipro Digital!</strong></p><p><strong>Feedback</strong></p><p>We aim to provide feedback as soon as possible. In the meantime, if you have any feedback on the process we would be very keen to hear it. We are constantly looking for ways to improve and refine how we work so would love to hear what your side of the story is, good or bad.</p>'
        },
        videos: {
          urls: [
            'https://www.youtube.com/watch?v=E_MIWWwnd60&feature=youtu.be'
          ]
        }
      },
      language: {
        code: 'en',
        label: 'English',
        labelNative: 'English (US)'
      }
    },
    properties: [
      {
        id: '5880c55be4b0cfde272956ad',
        label: 'Brands',
        value: {
          id: '83455af9-c888-4221-9312-4750b5a09bf5',
          label: 'Buildit'
        }
      },
      {
        id: 'COUNTRY',
        label: 'Country',
        value: {
          id: 'us',
          label: 'United States'
        }
      },
      {
        id: '58b7e4dce4b09a6d37a0ce40',
        label: 'Department',
        value: {
          id: '921917',
          label: 'Buildit Front End Engineering'
        }
      },
      {
        id: '58829560e4b0b087420f2dfd',
        label: 'Studios',
        value: {
          id: '837dc81e-9dc6-43db-a911-0557257d40a2',
          label: 'Denver'
        }
      },
      {
        id: '5882918ae4b0cfde272956b5',
        label: 'Exercise',
        value: {
          id: '35232a91-aa5f-4b35-8817-0c042ed83b9d',
          label: 'front end engineer'
        }
      }
    ]
  }
};

// This is sample raw job properties returned by SR
sr.jobProperties = {
  data: {
    content: [
      {
        id: 'a96d6187-0a2c-45dc-8636-c2b761fb406a',
        label: 'Job Title',
        type: 'TEXT',
        value: 'Front End Engineer',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/a96d6187-0a2c-45dc-8636-c2b761fb406a',
            method: 'GET'
          }
        }
      },
      {
        id: '6f8999f2-e309-4bff-a8bb-024413026ff4',
        label: 'Job Location',
        type: 'TEXT',
        value: 'Denver, CO',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/6f8999f2-e309-4bff-a8bb-024413026ff4',
            method: 'GET'
          }
        }
      },
      {
        id: '59c3ca95-cfa9-4cac-b1c1-e1a290ae6f95',
        label: 'First Name',
        type: 'TEXT',
        value: 'Ricky',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/59c3ca95-cfa9-4cac-b1c1-e1a290ae6f95',
            method: 'GET'
          }
        }
      },
      {
        id: '7bda1fdc-9830-4c05-a348-f5dc7e020cf7',
        label: 'Last Name',
        type: 'TEXT',
        value: 'Bobby',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/7bda1fdc-9830-4c05-a348-f5dc7e020cf7',
            method: 'GET'
          }
        }
      },
      {
        id: 'fbf1ae82-29e3-42eb-9ed0-2024cb750df8',
        label: 'Start Date',
        type: 'DATE',
        value: '2018-06-22T18:00:00.000Z',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/fbf1ae82-29e3-42eb-9ed0-2024cb750df8',
            method: 'GET'
          }
        }
      },
      {
        id: '1bd3a62c-29cf-4966-b75f-15fb69e417ba',
        label: 'Street Address One',
        type: 'TEXT',
        value: '1234 Chevy Rd',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/1bd3a62c-29cf-4966-b75f-15fb69e417ba',
            method: 'GET'
          }
        }
      },
      {
        id: 'd74437aa-c302-4b5f-a872-99121c2c7a4f',
        label: 'City',
        type: 'TEXT',
        value: 'Atlanta',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/d74437aa-c302-4b5f-a872-99121c2c7a4f',
            method: 'GET'
          }
        }
      },
      {
        id: 'd368f5b0-690e-4c33-a3ff-59efa72fca81',
        label: 'State/Region',
        type: 'REGION',
        value: 'us-ga',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/d368f5b0-690e-4c33-a3ff-59efa72fca81',
            method: 'GET'
          }
        }
      },
      {
        id: '32eefd70-c9c2-4a8e-961e-6bcdc3c8045f',
        label: 'Zip Code',
        type: 'TEXT',
        value: '30126',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/32eefd70-c9c2-4a8e-961e-6bcdc3c8045f',
            method: 'GET'
          }
        }
      },
      {
        id: '8ce1d02c-5b8e-41c9-a824-8b2cb39fdc7b',
        label: 'Country',
        type: 'COUNTRY',
        value: 'us',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/8ce1d02c-5b8e-41c9-a824-8b2cb39fdc7b',
            method: 'GET'
          }
        }
      },
      {
        id: 'a2efa2b4-bf32-4219-abf7-7e05c7836f0c',
        label: 'Annual Salary',
        type: 'CURRENCY',
        value: {
          code: 'USD',
          value: 100000
        },
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/a2efa2b4-bf32-4219-abf7-7e05c7836f0c',
            method: 'GET'
          }
        }
      },
      {
        id: 'e7d8fbad-b48b-43b2-97f7-be1baff6f6fa',
        label: 'Annual Bonus',
        type: 'CURRENCY',
        value: {
          code: 'USD',
          value: 10000
        },
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/e7d8fbad-b48b-43b2-97f7-be1baff6f6fa',
            method: 'GET'
          }
        }
      },
      {
        id: '77ab2717-a6b3-43e6-b5df-611e84583ca0',
        label: 'Signing Bonus',
        type: 'CURRENCY',
        value: {
          code: 'USD',
          value: 12345
        },
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/77ab2717-a6b3-43e6-b5df-611e84583ca0',
            method: 'GET'
          }
        }
      },
      {
        id: '05f1b2eb-65f2-46c7-ad73-c7b8bd688c33',
        label: 'SAP Employee ID',
        type: 'TEXT',
        value: '',
        actions: {
          configuration: {
            url: 'https://api.smartrecruiters.com/configuration/candidate-properties/05f1b2eb-65f2-46c7-ad73-c7b8bd688c33',
            method: 'GET'
          }
        }
      }
    ]
  }
};


const sap = {};

sap.goodReply = {
  output: {
    ReturnFlag: 'S',
    ReturnMessage: 'SUCCESS',
    EmployeeId: '20001376',
    contactNumber: '4101234567,4102345678',
    ApplicantId: '00631217',
    ResumeNumber: '343496',
    DateOfJoining: '24-May-2018',
    FirstName: 'Ricky'
  }
};

sap.badReplyEmployeeExists = {
  output: {
    ReturnFlag: 'F',
    ReturnMessage: 'Employee Id is already created for Candidate',
    EmployeeId: '20001376'
  }
};

sap.badReplyEmp002 = {
  ReturnFlag: 'F',
  ReturnMessage: 'ERROR-EMP-002'
};

module.exports = {
  applicant,
  sr,
  sap
};

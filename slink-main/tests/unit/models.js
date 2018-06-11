'use strict';

//
// This is the applicant model which we will create and use in our application
//
const applicant = {
  id: 'cc285818-963d-497a-a2a8-e2227af0876e',
  firstName: 'Ricky',
  lastName: 'Bobby',
  email: 'shakenbake@gmail.com',
  location: {
    country: 'United States',
    city: 'Atlanta',
  },
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
};

// This is sample raw candidate details returned by SR
sr.candidateDetail = {
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
};

// This is sample raw job properties returned by SR
sr.jobProperties = {
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
}

module.exports = {
  applicant: applicant,
  sr,
  sap
};

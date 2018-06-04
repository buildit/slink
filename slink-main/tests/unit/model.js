'use strict';

//
// This is the final model which we will create and use in our application
//
const mockedApplicantModel = {
  id: 'bca77011-ae94-4300-9847-360043e64fa2',
  firstName: 'Vilmos',
  lastName: 'Agoston',
  email: 'agoston.vilmos@gmail.com',
  location: {
    country: 'United Kingdom',
    city: 'Edinburgh',
  },
  primaryAssignment: {
    job: {
      id: 'aaf11eed-b69e-4ea5-97ad-43321f706fa5'
    },
  },
  phoneNumber: '123232323',
  experience: {
    location: 'LONDON'
  }
};


//
// This is the final model with only candidate summary
//
const mockedApplicantSummaryModel = {
  id: 'bca77011-ae94-4300-9847-360043e64fa2',
  firstName: 'Vilmos',
  lastName: 'Agoston',
  email: 'agoston.vilmos@gmail.com',
  location: {
    country: 'United Kingdom',
    city: 'Edinburgh',
  },
  primaryAssignment: {
    job: {
      id: 'aaf11eed-b69e-4ea5-97ad-43321f706fa5'
    },
  }
};


// This is sample raw candidate summary returned by SR
const mockedCandidateSummary = {
  id: 'bca77011-ae94-4300-9847-360043e64fa2',
  internal: false,
  firstName: 'Vilmos',
  lastName: 'Agoston',
  email: 'agoston.vilmos@gmail.com',
  location: {
    country: 'United Kingdom',
    city: 'Edinburgh',
    regionCode: 'Scotland',
    region: 'Scotland',
    lat: 55.95325,
    lng: -3.188267
  },
  averageRating: 4,
  createdOn: '2018-04-25T09:12:16.000Z',
  updatedOn: '2018-05-30T08:54:57.000Z',
  primaryAssignment: {
    job: {
      id: 'aaf11eed-b69e-4ea5-97ad-43321f706fa5',
      title: 'Platform Engineer',
      actions: {
        details: {
          url: 'https://api.smartrecruiters.com/jobs/aaf11eed-b69e-4ea5-97ad-43321f706fa5',
          method: 'GET'
        }
      }
    },
    status: 'OFFERED',
    subStatus: 'Offer Accepted'
  },
  actions: {
    details: {
      url: 'https://api.smartrecruiters.com/candidates/bca77011-ae94-4300-9847-360043e64fa2',
      method: 'GET'
    },
    properties: {
      url: 'https://api.smartrecruiters.com/candidates/bca77011-ae94-4300-9847-360043e64fa2/properties',
      method: 'GET'
    }
  }
};


// This is sample raw candidate details returned by SR
const mockedCandidateDetails = {
  id: 'aaa8878-ae94-4300-1212-1231873h232',
  internal: false,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@gmail.com',
  phoneNumber: '0123456789',
  web: {
    linkedin: 'https://www.linkedin.com/in/jdoe/'
  },
  createdOn: '2018-04-25T09:12:16.000Z',
  updatedOn: '2018-05-30T11:20:33.000Z',
  education: [
    {
      institution: 'University of UK',
      degree: 'Masters',
      major: 'Physics',
      current: false,
      location: 'Surrey, MD',
      startDate: '1996-09',
      endDate: '2003-09'
    },
  ],
  experience: [
    {
      title: 'Data Scientist',
      company: 'Lidl Magyarország Kereskedelmi Bt.',
      current: false,
      location: 'Budapest, , HU',
      startDate: '2017-01',
      endDate: '2018-02',
      description: 'Duties:\n- Building demand forecasting models and infrastructure for operating them\n- Defining workflow for development and deployment\n- Applied machine learning methods in supply chain optimization\n- Customer behavior analysis on Big Data platforms\n- We share our knowledge through a Data Science Academy with both internal and external participants\n\nKey achievements:\n- Better forecasts than the market leading product\n- Satisfied internal customers, they get what they really need\n- We have built a highly valued platform, other data scientist team inside Schwarz inc. are impressed\n- Our group have been selected as a Center of Excellence'
    }
  ],
  averageRating: 4,
  actions: {
    properties: {
      method: 'GET',
      url: 'https://api.smartrecruiters.com/candidates/bca77011-ae94-4300-9847-360043e64fa2/properties'
    },
    attachments: {
      method: 'GET',
      url: 'https://api.smartrecruiters.com/candidates/bca77011-ae94-4300-9847-360043e64fa2/attachments'
    }
  },
  primaryAssignment: {
    job: {
      id: 'aaf11eed-b69e-4ea5-97ad-43321f706fa5',
      title: 'Platform Engineer',
      actions: {
        details: {
          url: 'https://api.smartrecruiters.com/jobs/aaf11eed-b69e-4ea5-97ad-43321f706fa5',
          method: 'GET'
        }
      }
    },
    status: 'OFFERED',
    subStatus: 'Offer Accepted',
    source: 'UpStarters',
    actions: {
      sourceDetails: {
        url: 'https://api.smartrecruiters.com/configuration/sources/OTHER/values/eb65651c-de90-45ac-9664-88d61bf6a5cf',
        method: 'GET'
      }
    }
  }
};

module.exports = { mockedCandidateSummary, mockedCandidateDetails, mockedApplicantModel, mockedApplicantSummaryModel };

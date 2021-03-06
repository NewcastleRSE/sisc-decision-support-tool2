[![e2e tests Actions Status](https://github.com/NewcastleRSE/sisc-decision-support-tool2/workflows/e2eTesting/badge.svg)](https://github.com/NewcastleRSE/sisc-decision-support-tool2/actions) [![unit tests Actions Status](https://github.com/NewcastleRSE/sisc-decision-support-tool2/workflows/unitTesting/badge.svg)](https://github.com/NewcastleRSE/sisc-decision-support-tool2/actions)  [![Latest release](https://badgen.net/github/release/NewcastleRSE/sisc-decision-support-tool2)](https://github.com/NewcastleRSE/sisc-decision-support-tool2/releases) [![DOI](https://zenodo.org/badge/360428386.svg)](https://zenodo.org/badge/latestdoi/360428386)


# Spatial Inequality in the Smart City Decision Support Tool

## About

Angular client to offer a front end for the data and algorithms developed as part of the SISC Turing project. Users can overlay population characteristics onto a map of Newcastle-upon-Tyne or Gateshead Local Authorities. Additionally, users can submit their priority areas for placing air quality sensors and view potentially gains and losses from different algorithmically generated networks.   

The site relies on an instance of Geoserver and a PostGIS database. For a full description of the data included and setup instructions, see the Wiki.

## Documentation
    
[Wireframes](Smart%20Cities%20SDSS.pdf)    
[Component and data diagram](components.pdf)    
[Prototype 1](https://xd.adobe.com/view/45816c59-7473-4ce1-bec8-fed8c54b17c7-10d2/)    
[Prototype 2 (genetic algorithm)](https://xd.adobe.com/view/c21a0a9d-cff5-4f07-8a37-4f5a52a600d8-9749/screen/d7d1f5f8-25a4-432d-bdf7-b0e9816fedfa)   

### Project Team
Professor Rachel Franklin, Newcastle University  ([rachel.franklin@newcastle.ac.uk](mailto:rachel.franklin@newcastle.ac.uk))    
Eman Zied-Abozied, Newcastle University  ([eman.zied-abozied@newcastle.ac.uk](mailto:Eman.Zied-Abozied@newcastle.ac.uk))   
Dr Jack Roberts, The Alan Turing Institute ([jroberts@turing.ac.uk](mailto:jroberts@turing.ac.uk)) 
  
Previous team members:  
Caitlin Robinson, Liverpool University  
David Herbert, Newcastle University  

### RSE Contact
Dr Kate Court, RSE Team, Newcastle University ([kate.court@newcastle.ac.uk](mailto:kate.court@newcastle.ac.uk))  

## Built With

[Angular 9.1.15](https://angular.io/)  
[Material Design](https://v9.material.angular.io/)  
[Leaflet](https://leafletjs.com/plugins.html#printexport)  

## Getting Started

### Prerequisites

Node.js 10.13 is needed at a minimum.

### Installation

Clone the repo and navigate to it. Run ```npm install``` to install all the required packages.

### Running Locally

To run: ```ng serve```,

### Running Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Run `cypress:open` to execute end to end tests using [Cypress](https://www.cypress.io/).

## Deployment

The client is deployed to Azure using the Turing account. A Terraform file for the deployment exists [in the cloud-infrastructure repo](https://github.com/NewcastleRSE/cloud-infrastructure/tree/master/azure/sisc).

## Usage

[Site](https://sisc-decision-support-tool.azurewebsites.net)

Any links to production environment, video demos and screenshots.

## Roadmap

- [x] Initial Research  
- [x] Minimum viable product  
- [x] Alpha Release  
- [x] Feature-Complete Release  

## Contributing

### Main Branch
Protected and can only be pushed to via pull requests. Should be considered stable and a representation of production code.

### Dev Branch
Should be considered fragile, code should compile and run but features may be prone to errors.

### Feature Branches
A branch per feature being worked on.

https://nvie.com/posts/a-successful-git-branching-model/

## License

## Citation
See DOI badge at the top of the README



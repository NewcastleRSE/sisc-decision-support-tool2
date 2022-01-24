![e2e tests](https://github.com/NewcastleRSE/sisc-decision-support-tool2/actions/workflows/badge.svg)

# Spatial Inequality in the Smart City Decision Support Tool


## About

Angular client to offer a front end for the data and algorithms developed as part of the SISC Turing project. It allows users to overlay data on population characteristics onto a map. Additionally, users can submit their priority areas for placing air quality sensors and view potentially gains and losses from different placements.   

The site relies on an instance of Geoserver and a PostGIS database. For a full description of the data included, see the sisc-geoserver repo.

## Documentation

[Miro](https://miro.com/app/board/o9J_lJ5M7cM=/?invite_link_id=698620761435)
[Wireframes](Smart%20Cities%20SDSS.pdf)
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
Dr Kate Court,  
RSE Team,  
Newcastle University  
([kate.court@newcastle.ac.uk](mailto:kate.court@newcastle.ac.uk))  

## Built With

[Angular 9.1.15](https://angular.io/)  
[Material Design](https://v9.material.angular.io/)  
[https://leafletjs.com/plugins.html#printexport](https://something.com)  

## Getting Started

### Prerequisites

Node.js 10.13 is needed at a minimum.

### Installation

Clone the repo and navigate to it. Run ```npm install``` to install all the required packages.

### Running Locally

To run: ```ng serve```,

### Running Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Deployment

### Local

todo

### Production

The client is deployed to Azure using the Turing account. A Terraform file for the deployment exists [in the cloud-infrastructure repo](https://github.com/NewcastleRSE/cloud-infrastructure/tree/master/azure/sisc).

## Usage

[Site](https://sisc-decision-support-tool.azurewebsites.net)

Any links to production environment, video demos and screenshots.

## Roadmap

- [x] Initial Research  
- [x] Minimum viable product  
- [ ] Alpha Release  <-- You are Here 
- [ ] Feature-Complete Release  

## Contributing

### Main Branch
Protected and can only be pushed to via pull requests. Should be considered stable and a representation of production code.

### Dev Branch
Should be considered fragile, code should compile and run but features may be prone to errors.

### Feature Branches
A branch per feature being worked on.

https://nvie.com/posts/a-successful-git-branching-model/

## License

## Citiation

Please cite the associated papers for this work if you use this code:

```
@article{xxx2021paper,
  title={Title},
  author={Author},
  journal={arXiv},
  year={2021}
}
```


## Acknowledgements
This work was funded by a grant from the UK Research Councils, EPSRC grant ref. EP/L012345/1, “Example project title, please update”.

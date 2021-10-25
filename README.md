# SiscDecisionSupportTool2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.15.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag
for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Documentation

[Miro](https://miro.com/app/board/o9J_lJ5M7cM=/?invite_link_id=698620761435)
[Wireframes](Smart%20Cities%20SDSS.pdf)
[Prototype 1](https://xd.adobe.com/view/45816c59-7473-4ce1-bec8-fed8c54b17c7-10d2/)
[Prototype 2 (genetic algorithm)](https://xd.adobe.com/view/c21a0a9d-cff5-4f07-8a37-4f5a52a600d8-9749/screen/d7d1f5f8-25a4-432d-bdf7-b0e9816fedfa)

## Useful sites

- Add Lat Long to street address csv: https://odileeds.github.io/Postcodes2LatLon/
- Colour scheme generator: http://eyetracking.upol.cz/color/
- To load a shapefile into Postgis, use QGIS and follow this
  tutorial: https://naysan.ca/2020/07/26/upload-a-shapefile-into-a-postgis-table-using-qgis/#step3

## Data

For a full description of the data included, see the sisc-geoserver repo.

## Saved networks

Pre-generated JSON networks are saved in `assets/networks`.

- `oa11cd` - list of output areas in the order they are used in `sensors`e.g. `[oa1, oa2, oa3 ....]`
- `objectives` - list of objectives included in order appear in `coverage`
  e.g. `["Total Residents", "Residents Under 16", "Residents Over 65", "Workers"]`
- `obj_coverage` - 2D array with objectives as columns and networks as rows (cells contain coverage). Each column is a
  series in the swarm plots (for each entry (row) in `network.coverage`, get the nth element (column) to get coverage where n is the objective
  index). We need to keep track of the coverage index (network) so we know which points match up between series
- `sensors` - 2D array with sensors as columns and networks as rows (cells contain oa indices) e.g. `oa11cd[sensors[0][0]]` should give the OA code for the 1st sensor in the 1st network.
- `oa_coverage` - networks are rows and output areas are columns e.g. The coverage of output area index 2 (which has
  name `oa11cd[2]`) in network 3 is `oa_coverage[3][2]`

Filename format: `assets/networks/[Local authority]/theta_[100/250/500]_nsensors_[10/20/30/40/50/60/70/80/90/100].json`

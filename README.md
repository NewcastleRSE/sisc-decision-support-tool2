# SiscDecisionSupportTool2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.15.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### SQL statements
 split table into newcastle and gateshead
insert into postgis.disability_2015_by_lsoa_ncl SELECT * FROM postgis.disability_2015_by_lsoa where lsoa_name like '%Newcastle%'


select *
from postgis.tyne_and_wear_oa
inner join postgis.oa_la_lookup
on postgis.oa_la_lookup.code = postgis.tyne_and_wear_oa.code;


psql -h sisc-server.postgres.database.azure.com -U siscadmin@sisc-server -d gisdb -p 5432

\copy postgis.full_oa_la_lookup from 'C:\Users\nkc124\OneDrive - Newcastle University\Spatial Inequality\ne_oa_la2.csv' delimiter ',' csv header;



Add oa details to table using lookup table:

create table tyne_and_wear_oa_with_ladnm as (
	select tw.gid, tw.code, tw.geom, look.oa11cd, look.lsoa11cd, look.ladnm
from postgis.tyne_and_wear_oa as tw
inner join postgis.full_oa_la_lookup as look
on look.oa11cd = tw.code
)

create table postgis.oa_gates as (select * from postgis.tyne_and_wear_oa where ladnm like '%Gateshead%')



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



---Add oa details to table using lookup table:

create table tyne_and_wear_oa_with_ladnm as (
	select tw.gid, tw.code, tw.geom, look.oa11cd, look.lsoa11cd, look.ladnm
from postgis.tyne_and_wear_oa as tw
inner join postgis.full_oa_la_lookup as look
on look.oa11cd = tw.code
)


create table primary_schools_with_data as (
	select tw.geom, tw.name, look.*
from postgis.primary_schools_ncl as tw
inner join postgis.schools_gov_data_ncl as look
on look."SCHNAME" = tw.name
)

---Take age data and split into LA's, then add geom from OA table
create table postgis.ages_oa_ncl as (
	select *
from postgis.population_ages_ncl_gates_by_oa
inner join postgis.oa_ncl
on postgis.oa_ncl.code = postgis.population_ages_ncl_gates_by_oa.oa11cd
)

UPDATE postgis.ages_oa_ncl as ages
SET    geom = geo.geom
FROM   postgis.oa_ncl as geo
WHERE  ages.oa11cd=geo.code


---some schoola are named differently in geo file, to find them:
select tw.name
from postgis.primary_schools_ncl as tw
where not exists (
	select
	from postgis.schools_gov_data_ncl as look
	where look."SCHNAME" = tw.name
);

create table postgis.oa_gates as (select * from postgis.tyne_and_wear_oa where ladnm like '%Gateshead%')


### Shapefiles
To load a shapefile into Postgis, use QGIS and follow this tutorial: https://naysan.ca/2020/07/26/upload-a-shapefile-into-a-postgis-table-using-qgis/#step3


### JSON

optimisation returns:
{lad20cd: "E08000021", n_sensors: 10, theta: 500, sensors: Array(10), total_coverage: 0.2418388293063128, …}
coverage_history: (10) [0.042697903005677725, 0.07972781466543684, 0.10363391579438772, 0.12654333460108996, 0.1484366570535272, 0.168961317428737, 0.18944426470815984, 0.20898299013332094, 0.226998976912119, 0.2418388293063128]
lad20cd: "E08000021"
n_sensors: 10
oa_coverage: (910) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]
oa_weight: (910) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]
placement_history: (10) ["E00042670", "E00042877", "E00042429", "E00042260", "E00042305", "E00042447", "E00042270", "E00042570", "E00042820", "E00042884"]
pop_age_groups: {pop_total: {…}, pop_children: {…}, pop_elderly: {…}}
population_weight: 2
sensors: Array(10)
0: {x: 428240.232, y: 564344.739, oa11cd: "E00042570"}
1: {x: 422113.439, y: 564425.872, oa11cd: "E00042270"}
2: {x: 419906.846, y: 566409.152, oa11cd: "E00042260"}
3: {x: 425187.717, y: 566668.617, oa11cd: "E00042447"}
4: {x: 423141.78, y: 564703.669, oa11cd: "E00042877"}
5: {x: 423991.422, y: 564565.018, oa11cd: "E00042820"}
6: {x: 425661.382, y: 564790.322, oa11cd: "E00042670"}
7: {x: 422854.54, y: 568143.116, oa11cd: "E00042305"}
8: {x: 427098.128, y: 565789.177, oa11cd: "E00042429"}
9: {x: 421728.16, y: 565962.71, oa11cd: "E00042884"}
length: 10
__proto__: Array(0)
theta: 500
total_coverage: 0.2418388293063128
workplace_weight: -1
__proto__: Object



{
  "lsoaData": {
    "gid": 366,
    "code": "E01033556",
    "lsoa_name": "Newcastle upon Tyne 022H",
    "d_allperso": "2512",
    "d_limited": "285",
    "d_limited_": "11.345541400000000",
    "la_code": "E08000021",
    "la_name": "Newcastle upon Tyne",
    "imd_score": "18.48",
    "imd_rank": "15478",
    "imd_decile": "5",
    "imd_in_sco": "0.11",
    "imd_in_ran": "17655",
    "imd_in_dec": "6",
    "imd_em_sco": "0.08",
    "imd_em_ran": "19691",
    "imd_em_dec": "6",
    "imd_ed_sco": "31.25",
    "imd_ed_ran": "8095",
    "imd_ed_dec": "3",
    "imd_he_sco": "0.48",
    "imd_he_ran": "9639",
    "imd_he_dec": "3",
    "imd_cr_sco": "0.3",
    "imd_cr_ran": "11905",
    "imd_cr_dec": "4",
    "imd_ho_sco": "19.33",
    "imd_ho_ran": "17656",
    "imd_hous_d": "6",
    "imd_env_sc": "16.51",
    "imd_env_ra": "17244",
    "imd_env_de": "6",
    "name": "Newcastle upon Tyne 022H",
    "allpersons": 2512,
    "under7": 185,
    "under7_pc": "7.36",
    "under10": 219,
    "under10_pc": "8.72",
    "under14": 277,
    "under14_pc": "11.03",
    "over65": 167,
    "over65_pc": "6.65",
    "over75": 85,
    "over75_pc": "3.38",
    "eg_allresi": "2512",
    "eg_nonwhbr": "1383",
    "eg_nonwh_1": "55.06",
    "eg_whiteal": "1284",
    "eg_whitebr": "1112",
    "eg_whiteir": "17",
    "eg_whitegy": "7",
    "eg_whiteot": "148",
    "eg_mixedbr": "88",
    "eg_mixedca": "27",
    "eg_mixedaf": "17",
    "eg_mixedas": "27",
    "eg_mixedot": "17",
    "eg_asianbr": "916",
    "eg_asianin": "220",
    "eg_asianpa": "291",
    "eg_asianba": "67",
    "eg_asianch": "158",
    "eg_asianot": "180",
    "eg_blackbr": "140",
    "eg_blackaf": "130",
    "eg_blackca": "0",
    "eg_blackot": "10",
    "eg_other": "84",
    "eg_otherar": "52",
    "eg_otherot": "32",
    "lsoa_code": "E01033556",
    "population": 2512,
    "social_rented": 424,
    "social_rented_pc": "16.8789808917197452",
    "private_rented": 1437,
    "private_rented_pc": "57.2054140127388535",
    "other": 651,
    "other_pc": "25.9156050955414013"
  },
  "oaData": {
    "0": 3,
    "1": 6,
    "2": 6,
    "3": 17,
    "4": 11,
    "5": 14,
    "6": 12,
    "7": 17,
    "8": 14,
    "9": 11,
    "10": 16,
    "11": 12,
    "12": 9,
    "13": 11,
    "14": 13,
    "15": 8,
    "16": 19,
    "17": 17,
    "18": 5,
    "19": 10,
    "20": 17,
    "21": 17,
    "22": 26,
    "23": 18,
    "24": 25,
    "25": 16,
    "26": 17,
    "27": 28,
    "28": 30,
    "29": 32,
    "30": 30,
    "31": 0,
    "32": 1,
    "33": 0,
    "34": 0,
    "35": 0,
    "36": 1,
    "37": 0,
    "38": 0,
    "39": 0,
    "40": 0,
    "41": 19,
    "42": 22,
    "43": 18,
    "44": 26,
    "45": 20,
    "46": 12,
    "47": 14,
    "48": 13,
    "49": 12,
    "50": 14,
    "51": 12,
    "52": 7,
    "53": 9,
    "54": 9,
    "55": 6,
    "56": 7,
    "57": 7,
    "58": 3,
    "59": 7,
    "60": 5,
    "61": 8,
    "62": 8,
    "63": 4,
    "64": 4,
    "65": 2,
    "66": 6,
    "67": 5,
    "68": 3,
    "69": 1,
    "70": 4,
    "71": 1,
    "72": 5,
    "73": 4,
    "74": 2,
    "75": 5,
    "76": 1,
    "77": 1,
    "78": 2,
    "79": 2,
    "80": 0,
    "81": 1,
    "82": 0,
    "83": 0,
    "84": 0,
    "85": 1,
    "86": 0,
    "87": 1,
    "88": 0,
    "89": 2,
    "90": 0,
    "oa11cd": "E00042877",
    "population": 804,
    "workers": 83
  }
}

   oa_coverage: [
        {
          coverage: 0.7345058839832672,
          oa11cd: 'E00042665'
        },


colour scheme generateor: http://eyetracking.upol.cz/color/

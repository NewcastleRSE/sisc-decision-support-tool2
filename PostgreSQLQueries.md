
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

-- select ranges of ages
create table postgis.ages_oa_under18_ncl as (
select a.oa11cd, a.geom, (a."1" + a."2" + a."3"+ a."4"+ a."5"+ a."6"+ a."7"+ a."8" + a."9"+ a."10"+ a."11"+ a."12"
+ a."13"+ a."14"+ a."15"+ a."16"+ a."17")
as people
from postgis.ages_oa_ncl as a

)

----- to add column that is calculation of another, first add column then update it
alter table postgis.disability_2011_by_oa_leeds
add column percentagealldisinla numeric(10,7)

alter table postgis.ages_oa_under18_ncl
alter column percentage type numeric(10,7)

-- count total number of people across all OA
SELECT SUM (people) AS total FROM postgis.ages_oa_under18_ncl

update postgis.ages_oa_under18_ncl
set percentage = people
set percentage = (percentage/55512)*100

create table postgis.ages_oa_16_65_ncl as (
select a.oa11cd, a.geom, (
a."16" + a."17" + a."18"+ a."19"+ a."20"+
a."21"+ a."22"+ a."23" + a."24"+ a."25"+ a."26"+ a."27"	+ a."28"+ a."29"+ a."30"+
a."31"+ a."32"+ a."33" + a."34"+ a."35"+ a."36"+ a."37"	+ a."38"+ a."39"+ a."40"+
a."4"+ a."42"+ a."43" + a."44"+ a."45"+ a."46"+ a."47"	+ a."48"+ a."49"+ a."50"+
a."51"+ a."52"+ a."53" + a."54"+ a."55"+ a."56"+ a."57"	+ a."58"+ a."59"+ a."60"+
a."61"+ a."62"+ a."63" + a."64"+ a."65"+ a."66"+ a."67"	+ a."68"+ a."69"+ a."70"+
a."71"+ a."72"+ a."73" + a."74"+ a."75"+ a."76"+ a."77"	+ a."78"+ a."79"+ a."80"+
a."81"+ a."82"+ a."83" + a."84"+ a."85"+ a."86"+ a."87"	+ a."88"+ a."89"+ a."90"

)
as people
from postgis.ages_oa_ncl as a

)




--- combine columns to make address
update postgis.schools_gov_data_ncl
set address = concat("SCHNAME", ', ', "STREET" , ', ', "LOCALITY" , ', ', "TOWN" , ', ', "POSTCODE");

--- convert lat long into geometry
ALTER TABLE your_table ADD COLUMN geom geometry(Point, 4326);
then

UPDATE postgis.schools_gov_data_ncl_with_locations SET geom = ST_SetSRID(ST_MakePoint("Longitude", "Latitude"), 4326);

--- calculate area of OA
update postgis.oa_ncl
set area = st_area(geom)/1000000  (in km2)


--- density as % per km2
update postgis.ages_oa_66over_gates as ages
set density = ages.percentage/(select area from postgis.oa_gates as oa where ages.oa11cd=oa.code)


--- percentage disabled out of whole population
update postgis.disability_2011_by_oa_ncl as dis
set d_limited_=(dis.d_limited/pop.population)*100

from postgis.population_oa_ncl as pop
where dis.code = pop.oa11cd

--- disability density
SELECT SUM (d_limited) AS total FROM postgis.disability_2011_by_oa_ncl (=52577)

update postgis.disability_2011_by_oa_ncl
set percentagealldisinla = d_limited

set density = dis.percentagealldisinla/(select area from postgis.oa_ncl as oa where dis.code=oa.code)


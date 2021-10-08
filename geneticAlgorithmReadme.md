

## JSON data 

oa11cd - list of output areas in order they are used in sensors table e.g. [oa1, oa2, oa3 ....]


objectives - list of objectives included in order appear in coverage table e.g. ["Total Residents", "Residents Under 16", "Residents Over 65", "Workers"]


coverage - 2D array with objectives as columns and networks as rows (cells contain coverage). So each column is a series in the swarm plots

sensors - 2D array with sensors as columns and networks as rows (cells contain oa indices)

E.g. oa11cd[sensors[0][0]] should give the OA code for the 1st sensor in the 1st network.

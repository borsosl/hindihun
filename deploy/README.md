# Deployment

Terv: GCP free-tier Cloud Run-ban egy konténeren belül Solr végzi a full text
keresést, az App Engine-ben futó Express-es Node app szolgálja ki a statikus
és dinamikus tartalmat.

Habár a konténer efemer, nem baj ha az időnként egyszer írt DB és a kiszolgáló is
néha újraindul. Így van ingyenesen egy full text search támogató rendszer.

Másik opciók az ElasticSearch és PostrgeSQL lettek volna. Az előbbihez túl sok
memória kell neki ahhoz, hogy free-tier-en fusson. Utóbbit tokenizálási
problémák miatt ki kellett zárni.

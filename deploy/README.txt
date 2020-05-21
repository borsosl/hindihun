# Deployment

Terv: GCP free-tier Cloud Run-ban egy konténeren belül PostgreSQL és Node Express-es
app szolgálja ki a statikus és dinamikus tartalmat.

Habár a konténer efemer, nem baj ha az időnként egyszer írt DB és a kiszolgáló is
néha újraindul. Így van ingyenesen egy full text search támogató rendszer.
A másik opció az ElasticSearch lett volna, de túl sok memória kell neki ahhoz, hogy
free-tier-en fusson.

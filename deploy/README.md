# Deployment

Terv: GCP free-tier Cloud Run-ban egy konténeren belül PostgreSQL és Node Express-es
app szolgálja ki a statikus és dinamikus tartalmat.

Habár a konténer efemer, nem baj ha az időnként egyszer írt DB és a kiszolgáló is
néha újraindul. Így van ingyenesen egy full text search támogató rendszer.
A másik opció az ElasticSearch lett volna, de túl sok memória kell neki ahhoz, hogy
free-tier-en fusson.

*update 20.05.23*: a PostgreSQL FTS támogatásával meggyűlt a bajom, mert a szavak
szétbontásához kizárólag olyan parsere van, ami nem enged meg jeleket a szavakon
belül, még az aposztrófot sem. Így teljes KTRANS szavakat nem tudok kerestetni
vele. Ez egyetlen fennmaradó lightweight megoldás a Java és Lucene, ez sajnos
lényegesen több saját kódot jelent majd a DB rekordok létrehozásához képest.


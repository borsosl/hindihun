# Solr futtatása GCP Cloud Run-on

## Docker image registry

### Előkészítés

- gcloud telepítése
- a végén engedni kell az inicializálást
    - parancssorban scriptet futtat
    - bejelentkeztet google account-ba a neten (= gcloud auth login)
    - ~/.boto fájlba tárolja az account hozzáférési tokeneket
    - régiót és zónát kell választan (Frankfurt: eu-west-3)
    - projektet kell aktiválni (= gcloud auth activate-service-account)
- a dockernek auth providerként kell használnia a gcloud-ot
    - Docker futtatása
    - kézzel kell kiadni ezt:
        - gcloud auth configure-docker

### Image publikálás

A szokásos módon:
- docker push image

Az image nevének első tagja régió függő, a második a GCP projekt neve,
a harmadik az általunk adott név, pl:
- eu.gcr.io/hindihun/hindihun-solr:v1

Az image a storage-ba íródik, első alkalommal létrejön egy eu.artifacts kezdetű
bucket név. A storage kvótába persze beleszámít.


## Cloud Run

- create service
- régiónak a holland volt közel Frankfurthoz
- teszteléshez engedhető a nem autentikált allUsers
- extra paraméterek:
    - a Solr portja: 8983
    - 1 GB memória
    - skálázási maximum 1

## Működés

A standard Solr image ki lett egészítve a saját Solr core létrehozásával.
A konténer minden indulásakor letölti az utolsó konfig és adat mentését,
ami a storage-ban könnyedén cserélgethető. Ezt kibontja zipből és
átmásolja a core adatkönyvtárába. Innentől kezdve lehet FTS keresni benne.

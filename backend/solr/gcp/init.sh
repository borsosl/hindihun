#!/bin/bash

cd /home/solr
mkdir hindihun
gsutil cp gs://hindihun.appspot.com/solr/hindihun.zip .

# important not to unzip/copy directly to /var/solr/data
# it might be within a volume, and as such the owner cannot be set to solr
unzip hindihun.zip -d ./hindihun

mkdir hindieng
unzip /build/gcp/hindieng.zip -d ./hindieng

/opt/docker-solr/scripts/init-var-solr
. /opt/docker-solr/scripts/run-initdb
/opt/docker-solr/scripts/precreate-core hindihun ./hindihun
/opt/docker-solr/scripts/precreate-core hindieng ./hindieng
rm -rf ./hindihun ./hindieng
exec solr-fg

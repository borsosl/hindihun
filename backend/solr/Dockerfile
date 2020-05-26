# parent: https://github.com/docker-solr/docker-solr/blob/master/8.5/slim/Dockerfile
FROM solr:8.5.1-slim
WORKDIR /build
COPY gcp gcp

USER root
RUN apt-get -y update && \
    apt-get -y install 'python3.7' unzip && \
    ln -s "/usr/bin/python3.7" /usr/bin/python && \
    wget https://storage.googleapis.com/pub/gsutil.tar.gz && \
    tar -xzf gsutil.tar.gz -C /opt && \
    mkdir -p /home/solr && \
    cp gcp/.boto /home/solr && \
    chown -R solr:solr /home/solr
ENV PATH="${PATH}:/opt/gsutil"
USER solr

CMD bash gcp/init.sh

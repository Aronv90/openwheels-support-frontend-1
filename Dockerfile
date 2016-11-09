from node
workdir /data/backoffice

add .bowerrc /data/backoffice/
add package.json /data/backoffice/
add bower.json /data/backoffice/
run npm install -g grunt-cli bower && npm install && bower install --allow-root

add . /data/backoffice/
#run grunt dist-dev write-config:compile_dir

expose 35729 9000
cmd grunt server
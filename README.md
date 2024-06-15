# mario-kart-gen
Mario Kart 8 Setup Generator

```
docker run --net bridge --name mario-kart-gen -p 3000:3000 --restart unless-stopped -e "DATABASE_URL=mongodb://172.17.0.1/myDb" -e "PORT=3000" -e "SESSION_SECRET=b43905f561734854070c9ca3329e6de4" miguel1993/mario-kart-gen:latest
```

Need external mongodb container running
```
services:
  mongodb:
    container_name: mongodb
    image: mongodb/mongodb-community-server
    network_mode: bridge
    volumes:
      - /opt/mongodb:/data
    ports:
      - 27017:27017
    restart: unless-stopped
    ```
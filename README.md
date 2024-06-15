# mario-kart-gen
Mario Kart 8 Setup Generator

You need to copy the files from this repo in the "data" folder into your mapping location below.
```
services:
  mario-kart-gen:
    container_name: mario-kart-gen
    image: miguel1993/mario-kart-gen:latest
    network_mode: bridge
    ports:
      - 3000:3000
    volumes:
      - /opt/mario-kart-gen/data:/usr/src/app/data/
    environment:
      - DATABASE_URL=mongodb://172.17.0.1/myDb
      - PORT=3000
      - SESSION_SECRET=b43905f561734854070c9ca3329e6de4
    restart: unless-stopped
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
FROM  ubuntu:24.04 AS base-node
# install node and npm
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs
# install playwright
RUN npm install -g playwright
# create app directory
RUN mkdir -p /home/app
COPY . home/app
WORKDIR /home/app
RUN npm install
RUN npx playwright install
EXPOSE 3000 5173 4173

# FROM base-node AS dev-mode
# # RUN npx playwright-core install chromium
# CMD ["npm", "run", "dev"]

FROM base-node AS prod-mode
# RUN npx playwright-core install chromium
RUN npm run build
CMD ["npm", "run", "start"]


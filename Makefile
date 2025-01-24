dev:
	NODE_ENV=development VITE_REMOTE_FLAG=$(REMOTE ?= 0) \
	docker compose up --force-recreate files_scrapper_dev --build

prod:
	NODE_ENV=production \
	VITE_REMOTE_FLAG=$(REMOTE ?= 0) \
	docker compose up --force-recreate files_scrapper_prod --build

# stop and remove container
rm:
	docker compose down

# remove container and image
clean-dev:
	docker compose down -v && \
	docker rmi scrapper_despacho-files_scrapper_dev files_scrapper_dev

clean-prod:
	docker compose down -v && \	
	rm -rf ./node_modules && \
	rm -rf ./frontend/dist ./frontend/node_modules && \
	rm -rf ./backend/dist ./backend/node_modules && \
	docker rmi scrapper_despacho-files_scrapper_prod files_scrapper_prod
	
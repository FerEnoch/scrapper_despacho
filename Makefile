dev:
	echo " 😞 ~ Dev enviroment not available"

prod:
	NODE_ENV=production \
	docker build -t files_scrapper_prod .
	docker run --rm --ipc=host \
	--name files_scrapper_prod \
	--security-opt seccomp=seccomp_profile.json \
	-p 3000:3000 \
	-p 5173:5173 \
	-p 4173:4173 \
	files_scrapper_prod

# stop and remove container
stop:
	docker container stop files_scrapper_prod 	

clean:
	docker container stop files_scrapper_prod || true && \
	docker rm files_scrapper_prod || true && \
	docker rmi -f files_scrapper_prod || true && \
	rm -rf ./node_modules && \
	rm -rf ./frontend/dist && \
	rm -rf ./frontend/node_modules && \
	rm -rf ./backend/dist && \
	rm -rf ./backend/node_modules
	
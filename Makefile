dev:
	echo " 😞 ~ Dev enviroment not available"

back-prod:
	NODE_ENV=production docker build -t scrapper-api . && \
	docker run -d --rm --ipc=host \
	--name scrapper-api \
	--security-opt seccomp=seccomp_profile.json \
	-p 3000:3000 \
	scrapper-api

# stop and remove container
stop:
	docker container stop scrapper-api 	

clean:
	docker container stop scrapper-api || true && \
	docker rm scrapper-api || true && \
	docker rmi -f scrapper-api || true && \
	rm -rf ./frontend/dist || true && \
	rm -rf ./frontend/node_modules || true && \
	rm -rf ./node_modules || true && \
	rm -rf ./backend/dist || true && \
	rm -rf ./backend/node_modules || true && \ 
	rm ./backend/users.db || true && \
	rm ./backend/users.db-shm || true && \
	rm ./backend/users.db-wal
	
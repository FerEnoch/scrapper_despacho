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
	rn -rf ./frontend/dist && \
	rm -rf ./frontend/node_modules && \
	rm -rf ./node_modules && \
	rm -rf ./backend/dist && \
	rm -rf ./backend/node_modules
	
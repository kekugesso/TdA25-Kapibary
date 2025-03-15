#!/bin/bash

# Function to clean up Docker container and image
cleanup() {
  echo -e "\e[32mCleaning up...\e[0m"
  docker stop "$container_id" >/dev/null 2>&1
  docker rm "$container_id" >/dev/null 2>&1
  docker rmi "$image_id" >/dev/null 2>&1
  echo -e "\e[32mCleanup complete.\e[0m"
}

trap cleanup EXIT

# Define ports to expose on the container
EXPOSED_PORTS="-p 80:80 -p 2568:2568"

while true; do
  echo -e "\e[32mBuilding Docker image...\e[0m"
  # Build Docker image using buildx and show full output
  docker buildx build . --tag interactive-dev-image --load
  if [ $? -ne 0 ]; then
    echo -e "\e[31mFailed to build Docker image. Exiting.\e[0m"
    exit 1
  fi
  # Get the image ID
  image_id=$(docker images -q interactive-dev-image)
  echo -e "\e[32mDocker image built: $image_id\e[0m"

  echo -e "\e[32mStarting Docker container...\e[0m"
  # Run Docker container with exposed ports
  container_id=$(docker run -d $EXPOSED_PORTS "$image_id")
  if [ $? -ne 0 ]; then
    echo -e "\e[31mFailed to start Docker container. Exiting.\e[0m"
    exit 1
  fi
  echo -e "\e[32mDocker container started: $container_id\e[0m"

  echo -e "\e[32mShowing container logs. Press [Ctrl+C] to stop viewing logs.\e[0m"
  docker logs -f "$container_id"

  echo -e "\e[32mInteract with your container. Press [Enter] when done.\e[0m"
  read -r

  echo -e "\e[32mStopping Docker container...\e[0m"
  docker stop "$container_id" >/dev/null 2>&1
  echo -e "\e[32mDocker container stopped.\e[0m"

  echo -e "\e[32mDeleting Docker container and image...\e[0m"
  docker rm "$container_id" >/dev/null 2>&1
  docker rmi "$image_id" >/dev/null 2>&1
  echo -e "\e[32mContainer and image deleted.\e[0m"

  echo -e "\e[32mPress [Enter] to start a new iteration or <Ctrl-C> to exit.\e[0m"
  read -r

done

# Use Playwright image directly for your application
FROM mcr.microsoft.com/playwright:v1.49.1-noble

# create app directory
WORKDIR /home/app

# Copy application source code
COPY . /home/app

# Adjust permissions for application directory
RUN chown -R pwuser:pwuser /home/app

# Use Playwright-specific node user for executing
USER pwuser

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 3000

VOLUME [ "/home/app/backend/db" ]

# Build and start the app
RUN npm run build:back

CMD ["npm", "run", "start:back"]

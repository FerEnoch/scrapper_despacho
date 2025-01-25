# Use Playwright image directly for your application
FROM mcr.microsoft.com/playwright:v1.49.1-noble

# create app directory
WORKDIR /home/app

# Copy application source code
COPY . /home/app

# Adjust permissions for application directory
RUN chown -R pwuser:pwuser /home/app

# Switch to pwuser
USER pwuser

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 3000 5173 4173

# Build and start the app
RUN npm run build

# Use Playwright-specific node user for executing
USER pwuser

CMD ["npm", "run", "start"]

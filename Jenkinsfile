pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'
        
        APP_TARGET           = '/var/boss-app'

        // Inject credentials
        FRONT_ENV_FILE = credentials('MY_ENV_FRONT') // fenv.txt
        BACK_ENV_FILE  = credentials('MY_ENV_BACK')  // env.txt
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                echo "🚜 Workspace ready. Jenkins automatically checked out the latest code."
            }
        }

        stage('Deploy to Server via Docker') {
            steps {
                echo "📤 Deploying full stack using Docker Compose..."
                script {
                    echo "===== PREPARING ENVIRONMENT FILES ====="
                    writeFile file: 'frontend/.env', text: "${FRONT_ENV_FILE}"
                    writeFile file: 'backend/.env', text: "${BACK_ENV_FILE}"
                }
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    
                    echo "===== PREPARING DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${APP_TARGET} &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${APP_TARGET}
                    "

                    echo "===== COPYING PROJECT FILES (including .env) ====="
                    # Sync only necessary files (excluding local node_modules)
                    rsync -avz --delete --exclude 'node_modules' --exclude 'frontend/node_modules' --exclude 'backend/node_modules' . ${SERVER_USER}@${SERVER_HOST}:${APP_TARGET}/

                    echo "===== STARTING CONTAINERS ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        cd ${APP_TARGET} &&
                        # Stop existing services to free up ports
                        sudo pm2 delete all || true &&
                        sudo docker-compose down --remove-orphans || true &&
                        sudo docker-compose up -d --build
                    "

                    echo "===== NOTE: PLEASE ENSURE HOST NGINX PROXIES /boss TO PORT 8081 ====="
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Full-stack Docker deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Please check Jenkins console output.'
        }
    }
}
pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'

        FRONTEND_TARGET      = '/var/www/html'
        BACKEND_TARGET       = '/var/backend'
        BACKEND_PROCESS_NAME = 'my-backend'
        
        // Normalize workspace path for Windows agents
        WS_PATH              = "${env.WORKSPACE.replace('\\', '/')}"
    }

    stages {
        stage('Clone Source') {
            steps {
                // Jenkins usually does this automatically if configured with repository URL
                // But we keep it if the user specifically needs it
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING BACKEND DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${BACKEND_TARGET} && 
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${BACKEND_TARGET}
                    "

                    echo "===== RSYNC BACKEND FILES ====="
                    # Note: We exclude node_modules to let the remote server handle them
                    rsync -avz --delete --exclude 'node_modules' backend/ ${SERVER_USER}@${SERVER_HOST}:${BACKEND_TARGET}/

                    echo "===== RESTARTING BACKEND SERVICE ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        bash -l -c 'cd ${BACKEND_TARGET} && npm install --omit=dev && (pm2 restart ${BACKEND_PROCESS_NAME} || pm2 start index.js --name ${BACKEND_PROCESS_NAME})'
                    "
                    """
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING FRONTEND DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} && 
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC FRONTEND BUILD ====="
                    # Vite builds to 'dist/', corrected from 'build/'
                    rsync -avz --delete frontend/dist/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    echo "===== RESTARTING NGINX ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo chown -R www-data:www-data ${FRONTEND_TARGET} &&
                        sudo find ${FRONTEND_TARGET} -type d -exec chmod 755 {} \\; &&
                        sudo find ${FRONTEND_TARGET} -type f -exec chmod 644 {} \\; &&
                        sudo nginx -t && sudo systemctl restart nginx
                    "
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully. Backend and frontend updated.'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
    }
}

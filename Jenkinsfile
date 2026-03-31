pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'
        
        FRONTEND_TARGET      = '/var/www/myapp'
        BACKEND_TARGET       = '/var/backend'
        BACKEND_PROCESS_NAME = 'my-node-backend'
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                echo "🚜 Workspace ready. Jenkins automatically checked out the latest code."
                // Do NOT use deleteDir() here, or you will delete the code Jenkins just downloaded!
                // Do NOT use git ..., or Jenkins will crash searching for duplicate commits.
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🏗️ Building React Frontend..."
                dir('frontend') {
                    sh 'npm install'
                    sh 'env CI=false npm run build'
                }
            }
        }

        // 🚀 Backend intentionally has no build stage because it's native Node.js
        stage('Deploy Backend (Node.js)') {
            steps {
                echo "📤 Deploying Backend directly to server..."
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING BACKEND DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${BACKEND_TARGET} && 
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${BACKEND_TARGET}
                    "

                    echo "===== COPYING BACKEND FILES ====="
                    # We only copy the source code, ignoring local node_modules
                    rsync -avz --delete --exclude 'node_modules' backend/ ${SERVER_USER}@${SERVER_HOST}:${BACKEND_TARGET}/

                    echo "===== INSTALLING DEPENDENCIES & RESTARTING NODE ====="
                    # Runs npm install directly on the server, then restarts via PM2
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        bash -l -c 'cd ${BACKEND_TARGET} && npm install --omit=dev && (pm2 restart ${BACKEND_PROCESS_NAME} || pm2 start index.js --name ${BACKEND_PROCESS_NAME})'
                    "
                    """
                }
            }
        }

        stage('Deploy Frontend (React)') {
            steps {
                echo "📤 Deploying Frontend build to Nginx..."
                script {
                    if (!fileExists('frontend/build/index.html')) {
                        error "❌ Deployment aborted: 'frontend/build/index.html' missing!"
                    }
                }
                
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING FRONTEND DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} && 
                        sudo rm -rf ${FRONTEND_TARGET}/* &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC FRONTEND BUILD ====="
                    rsync -avz --delete frontend/build/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    echo "===== APPLYING NGINX PERMISSIONS & RESTARTING ====="
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
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
            echo '✅ Full-stack deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Please check Jenkins console output.'
        }
    }
}

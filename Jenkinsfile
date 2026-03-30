pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'

        FRONTEND_PATH        = '/home/abdenab/myapp'
        BACKEND_PATH         = '/home/abdenab/backend'
        BACKEND_PROCESS_NAME = 'my-backend'
    }

    stages {

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${env.SSH_CREDS_ID}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                    echo "===== TEST SSH CONNECTION ====="
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" $SSH_USER@${SERVER_HOST} "echo SSH SUCCESS" || exit 1

                    echo "===== CREATE FRONTEND DIRECTORY ====="
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" $SSH_USER@${SERVER_HOST} "mkdir -p ${FRONTEND_PATH}" || exit 1

                    echo "===== UPLOAD FRONTEND ====="
                    scp -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" -r "$WORKSPACE/frontend/dist/." $SSH_USER@${SERVER_HOST}:${FRONTEND_PATH} || exit 1

                    echo "===== RELOAD NGINX ====="
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" $SSH_USER@${SERVER_HOST} "sudo nginx -s reload || echo Nginx reload skipped"
                    '''
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${env.SSH_CREDS_ID}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                    echo "===== CREATE BACKEND DIRECTORY ====="
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" $SSH_USER@${SERVER_HOST} "mkdir -p ${BACKEND_PATH}" || exit 1

                    echo "===== UPLOAD BACKEND ====="
                    scp -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" -r "$WORKSPACE/backend/." $SSH_USER@${SERVER_HOST}:${BACKEND_PATH} || exit 1

                    echo "===== INSTALL & START BACKEND ====="
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$SSH_KEY" $SSH_USER@${SERVER_HOST} "
                        cd ${BACKEND_PATH} && \
                        npm install --production && \
                        (pm2 restart ${BACKEND_PROCESS_NAME} || pm2 start index.js --name ${BACKEND_PROCESS_NAME})
                    " || exit 1
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed! Check logs above.'
        }
    }
}

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

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
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
                    bat """
                    echo ===== FIX SSH KEY PERMISSIONS =====
                    icacls "%SSH_KEY%" /inheritance:r
                    icacls "%SSH_KEY%" /grant:r "SYSTEM:R"

                    echo ===== TEST SSH CONNECTION =====
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@${env.SERVER_HOST} "echo SSH SUCCESS" || exit 1

                    echo ===== CREATE FRONTEND DIRECTORY =====
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@${env.SERVER_HOST} "mkdir -p ${env.FRONTEND_PATH}" || exit 1

                    echo ===== UPLOAD FRONTEND =====
                    scp -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r "%WORKSPACE%\\frontend\\dist\\." %SSH_USER%@${env.SERVER_HOST}:${env.FRONTEND_PATH} || exit 1

                    echo ===== RELOAD NGINX =====
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@${env.SERVER_HOST} "sudo nginx -s reload || echo Nginx reload skipped"
                    """
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
                    bat """
                    echo ===== FIX SSH KEY PERMISSIONS =====
                    icacls "%SSH_KEY%" /inheritance:r
                    icacls "%SSH_KEY%" /grant:r "SYSTEM:R"

                    echo ===== CREATE BACKEND DIRECTORY =====
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@${env.SERVER_HOST} "mkdir -p ${env.BACKEND_PATH}" || exit 1

                    echo ===== UPLOAD BACKEND =====
                    scp -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r "%WORKSPACE%\\backend\\." %SSH_USER%@${env.SERVER_HOST}:${env.BACKEND_PATH} || exit 1

                    echo ===== INSTALL & START BACKEND =====
                    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@${env.SERVER_HOST} ^
                    "cd ${env.BACKEND_PATH} && npm install --production && (pm2 restart ${env.BACKEND_PROCESS_NAME} || pm2 start index.js --name ${env.BACKEND_PROCESS_NAME})" || exit 1
                    """
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
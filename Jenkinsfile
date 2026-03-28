pipeline {
    agent any

    environment {
        SERVER_USER      = 'abdenab'
        SERVER_HOST      = '10.8.101.33'
        SSH_CREDS_ID     = 'linux-ssh-creds'
        FRONTEND_PATH    = '/home/abdenab/myapp'
        BACKEND_PATH     = '/home/abdenab/backend'
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

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }

        stage('Deploy Frontend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.SSH_CREDS_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat """
                    echo Creating frontend directory...
                    ssh -i "%SSH_KEY%" -T -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 %SSH_USER%@${env.SERVER_HOST} "mkdir -p /home/%SSH_USER%/myapp"

                    echo Uploading frontend dist...
                    scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no -r "%WORKSPACE%\\frontend\\dist\\." %SSH_USER%@${env.SERVER_HOST}:/home/%SSH_USER%/myapp

                    echo Reloading Nginx...
                    ssh -i "%SSH_KEY%" -T -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 %SSH_USER%@${env.SERVER_HOST} "sudo nginx -s reload"
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.SSH_CREDS_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat """
                    echo Creating backend directory...
                    ssh -i "%SSH_KEY%" -T -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 %SSH_USER%@${env.SERVER_HOST} "mkdir -p /home/%SSH_USER%/backend"

                    echo Uploading backend files...
                    scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no -r "%WORKSPACE%\\backend\\." %SSH_USER%@${env.SERVER_HOST}:/home/%SSH_USER%/backend

                    echo Restarting backend with PM2...
                    ssh -i "%SSH_KEY%" -T -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 %SSH_USER%@${env.SERVER_HOST} "cd /home/%SSH_USER%/backend && npm install --production && (pm2 restart ${env.BACKEND_PROCESS_NAME} || pm2 start index.js --name ${env.BACKEND_PROCESS_NAME})"
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Full Stack Linux Deployment Successful!'
        }
        failure {
            echo 'Deployment failed. Check Jenkins logs for details.'
        }
    }
}
pipeline {
    agent any

    environment {
        // --- CONFIGURE THESE IN JENKINS ---
        SERVER_USER      = 'Abdenab' // e.g., 'ubuntu' or 'root'
        SERVER_HOST      = '[IP_ADDRESS]'   // e.g., '192.168.1.100'
        SSH_CREDS_ID     = 'linux-ssh-creds' // The ID of credentials you added to Jenkins
        
        FRONTEND_PATH    = '/var/www/myapp'
        BACKEND_PATH     = '/home/Abdenab/backend'
        BACKEND_PROCESS_NAME = 'my-backend'
    }

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    // Use bat or sh depending on where Jenkins agent runs
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
                    echo Uploading frontend dist...
                    scp -i %SSH_KEY% -o StrictHostKeyChecking=no -r frontend/dist/* %SSH_USER%@${env.SERVER_HOST}:${env.FRONTEND_PATH}
                    
                    echo Reloading Nginx...
                    ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %SSH_USER%@${env.SERVER_HOST} "sudo nginx -s reload"
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.SSH_CREDS_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat """
                    echo Uploading backend files...
                    scp -i %SSH_KEY% -o StrictHostKeyChecking=no -r backend/* %SSH_USER%@${env.SERVER_HOST}:${env.BACKEND_PATH}
                    
                    echo Restarting Backend with PM2...
                    ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %SSH_USER%@${env.SERVER_HOST} "cd ${env.BACKEND_PATH} && npm install --production && pm2 restart ${env.BACKEND_PROCESS_NAME} || pm2 start index.js --name ${env.BACKEND_PROCESS_NAME}"
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


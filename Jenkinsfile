pipeline {
    agent any

    environment {
        // --- CONFIGURE THESE IN JENKINS ---
        SERVER_USER      = 'abdenab' // e.g., 'ubuntu' or 'root'
        SERVER_HOST      = '10.8.101.33'
        SSH_CREDS_ID     = 'linux-ssh-creds' // The ID of credentials you added to Jenkins
        
        FRONTEND_PATH    = '/var/www/myapp'
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
                    echo Archiving frontend...
                    tar -czf frontend.tar.gz -C frontend/dist .
                    
                    echo Uploading frontend archive...
                    scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no frontend.tar.gz %SSH_USER%@${env.SERVER_HOST}:/tmp/frontend.tar.gz
                    
                    echo Extracting and Reloading Nginx...
                    ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@${env.SERVER_HOST} "sudo mkdir -p ${env.FRONTEND_PATH} && sudo tar -xzf /tmp/frontend.tar.gz -C ${env.FRONTEND_PATH} && sudo rm /tmp/frontend.tar.gz && sudo nginx -s reload"
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.SSH_CREDS_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat """
                    echo Archiving backend (excluding node_modules)...
                    tar --exclude=node_modules -czf backend.tar.gz -C backend .
                    
                    echo Uploading backend archive...
                    scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no backend.tar.gz %SSH_USER%@${env.SERVER_HOST}:/tmp/backend.tar.gz
                    
                    echo Extracting and Restarting PM2...
                    ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@${env.SERVER_HOST} "mkdir -p ${env.BACKEND_PATH} && tar -xzf /tmp/backend.tar.gz -C ${env.BACKEND_PATH} && rm /tmp/backend.tar.gz && cd ${env.BACKEND_PATH} && npm install --production && (pm2 restart ${env.BACKEND_PROCESS_NAME} || pm2 start index.js --name ${env.BACKEND_PROCESS_NAME})"
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


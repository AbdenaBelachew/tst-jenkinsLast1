pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'

        // Updated to your "Option A" recommendation
        FRONTEND_TARGET      = '/var/www/myapp'
        
        WS_PATH              = "${env.WORKSPACE.replace('\\', '/')}"
    }

    stages {
        stage('Clone Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING PRODUCTION DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} && 
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC BUILD TO PRODUCTION ====="
                    # build/ syncs contents only, --delete ensures clean deployment
                    rsync -avz --delete build/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    echo "===== APPLYING NGINX PERMISSIONS & RESTARTING ====="
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
            echo '✅ Production deployment successful to /var/www/myapp'
        }
        failure {
            echo '❌ Deployment failed! Please check Nginx logs or SSH connectivity.'
        }
    }
}

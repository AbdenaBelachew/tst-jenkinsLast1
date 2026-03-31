pipeline {
    agent any

    environment {
        SERVER_USER     = 'abdenab'
        SERVER_HOST     = '10.8.101.33'
        SSH_CREDS_ID    = 'linux-ssh-creds'
        FRONTEND_TARGET = '/var/www/myapp'
    }

    stages {

        stage('Prepare') {
            steps {
                echo "💻 Building on: ${env.NODE_NAME}"

                // Use ONLY one branch (fixes your confusion)
                git branch: 'newbr', url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git'
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🏗️ Starting Build..."

                script {
                    // Check if package.json exists before running npm
                    if (!fileExists('package.json')) {
                        error "❌ package.json not found! Fix repo or update path."
                    }
                }

                sh 'npm install'
                sh 'CI=false npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                script {
                    if (!fileExists('build/index.html')) {
                        error "❌ Build failed: build/index.html not found."
                    }
                }

                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e

                    echo "===== PREPARING PRODUCTION DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC BUILD TO PRODUCTION ====="
                    rsync -avz --delete build/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    echo "===== RESTARTING NGINX ====="
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo chown -R www-data:www-data ${FRONTEND_TARGET} &&
                        sudo chmod -R 755 ${FRONTEND_TARGET} &&
                        sudo nginx -t &&
                        sudo systemctl restart nginx
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
            echo '❌ Deployment failed! Check logs.'
        }
        always {
            // FIX: cleanWs() removed (plugin missing)
            deleteDir()
        }
    }
}
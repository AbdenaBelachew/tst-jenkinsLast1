pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'
        FRONTEND_TARGET      = '/var/www/myapp'
        
        // Normalize workspace path for Windows agents
        WS_PATH              = "${env.WORKSPACE.replace('\\', '/')}"
    }

    stages {
        stage('Prepare') {
            steps {
                echo "💻 Building on: ${env.NODE_NAME}"
                // Ensure fresh project state
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'newbr'
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🏗️ Starting Build..."
                // CI=false prevents failing on minor lint/style warnings
                sh 'npm install'
                sh 'env CI=false npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                // Safety check: Don't deploy if build folder is missing
                script {
                    if (!fileExists('build/index.html')) {
                        error "❌ Build failed: 'build/index.html' not found."
                    }
                }
                
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING PRODUCTION DIRECTORY ====="
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} && 
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC BUILD TO PRODUCTION ====="
                    rsync -avz --delete build/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

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
            echo '✅ Production deployment successful to /var/www/myapp'
        }
        failure {
            echo '❌ Deployment failed! Please check console output or server connectivity.'
        }
        always {
            // Clean workspace to save space and avoid cross-build contamination
            cleanWs()
        }
    }
}

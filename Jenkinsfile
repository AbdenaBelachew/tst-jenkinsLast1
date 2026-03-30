pipeline {
    agent any
    
    stages {
        
        stage('Clone Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }
        
        stage('Build / Prepare') {
            steps {
                echo "Repository cloned. You can add build steps here if needed."
            }
        }
        
        stage('Deploy to Ubuntu') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "mkdir -p ~/deploy"
                    '''
                    sh '''
                      scp -o StrictHostKeyChecking=no -r $WORKSPACE/* abdenab@10.8.101.33:~/deploy/
                    '''
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "echo Deployment from Jenkins completed."
                    '''
                }
            }
        }
        
    }
    
    post {
        success { echo 'Pipeline completed successfully.' }
        failure { echo 'Pipeline failed.' }
    }
}

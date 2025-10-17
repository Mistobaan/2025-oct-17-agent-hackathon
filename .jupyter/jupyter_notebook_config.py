# Jupyter Notebook Configuration
c = get_config()

# Server settings
c.NotebookApp.ip = '127.0.0.1'
c.NotebookApp.port = 8888
c.NotebookApp.open_browser = False
c.NotebookApp.token = ''
c.NotebookApp.password = ''
c.NotebookApp.allow_origin = '*'
c.NotebookApp.allow_remote_access = True

# Content settings
c.ContentsManager.allow_hidden = True
c.NotebookApp.contents_manager_class = 'notebook.services.contents.largefilemanager.LargeFileManager'

# Kernel settings
c.MappingKernelManager.default_kernel_name = 'python3'

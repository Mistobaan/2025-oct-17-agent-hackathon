# Jupyter Lab Configuration
c = get_config()

# Server settings
c.ServerApp.ip = '127.0.0.1'
c.ServerApp.port = 8888
c.ServerApp.open_browser = False
c.ServerApp.token = ''
c.ServerApp.password = ''
c.ServerApp.allow_origin = '*'
c.ServerApp.allow_remote_access = True

# Lab settings
c.LabApp.collaborative = True
c.LabApp.dev_mode = False

# Content manager
c.ContentsManager.allow_hidden = True

# Kernel settings
c.MappingKernelManager.default_kernel_name = 'python3'

# Extension settings
c.LabServerApp.blacklist_uris = []
c.LabServerApp.whitelist_uris = []

<template>
  <div id="app">
    <AppHeader></AppHeader>
    <section class="project-manage">
      <el-row type="flex" justify="center">
        <el-input
          class="inline-block" style="width: 400px; margin-right: 20px;"
          placeholder="请输入搜索项目名称" size="medium" suffix-icon="el-icon-search"
          v-model.trim="queryStr" @keyup.enter.native="query" @blur="query"></el-input>
        <el-button type="primary" icon="el-icon-plus" size='mini' @click="toggleDialog">导入项目</el-button>
      </el-row>
    </section>
    <section class="project-wapper">
      <div v-if="!projectList[0] || !projectList[0].path" class="empty-data">暂无数据</div>
      <ul>
        <li class="project-block" v-for="item in projectList" :key="item.path">
          <!-- 启动 -->
          <el-button
            class="start-server-button"
            v-tooltip="{ content: '启动服务' }"
            icon="el-icon-caret-right"
            type="primary" 
            size="small"
            plain circle
            @click="startServer(item)"></el-button>
          <!-- 项目名称 -->
          <section class="title" @click="gotoProject(item)">
            <el-link
              v-tooltip="{ idssOverWidthDisplay: true }"
              type="primary" class="maintitle ellipsis">
              {{item.name}}
              <i class="el-icon-edit"></i>
            </el-link>
          </section>
          <!-- 项目描述 -->
          <section class="desc">
            {{item.path}}
          </section>
          <!-- 操作项 -->
          <p class="operation">
            <!-- 打开文件夹 -->
            <el-button
              v-tooltip="{ content: '打开文件夹' }"
              icon="el-icon-folder-opened"
              size="small"
              @click="openProject(item.path)"></el-button>
            <!-- 打开编辑器 -->
            <el-button
              v-tooltip="{ content: '打开编辑器' }"
              icon="el-icon-bank-card"
              size="small"
              @click="openEditor(item.path)"></el-button>
            <!-- 删除文件夹 -->
            <el-button
              v-tooltip="{ content: '删除' }"
              icon="el-icon-delete"
              size="small"
              @click="delProject(item.path)"></el-button>
          </p>
        </li>
      </ul>
    </section>
    <!-- 新增项目弹框 -->
    <el-dialog title="导入项目"
      :visible.sync="addProjectDialog"
      :append-to-body="true"
      width="550px">
      <add-project
        :visible.sync="addProjectDialog"
        @select="addProject"></add-project>
    </el-dialog>
    <!-- 配置项目弹框 -->
    <el-dialog title="配置项目"
      :visible.sync="configProjectDialog"
      :append-to-body="true"
      width="550px">
      <config-project
        :visible.sync="configProjectDialog"
        :data="configProjectData"
        @config="configProject"></config-project>
    </el-dialog>
    <!-- 配置项目弹窗 -->
    <!-- tooltip占位 -->
    <el-tooltip ref="tooltip" v-bind="tooltipOpt"/>
  </div>
</template>

<script>
import ElTooltip from 'element-ui/lib/tooltip'
import Fuse from 'fuse.js'
import { getLocalData, setLocalData } from '../custom/utils'
import AddProject from './components/add-project.vue'
import configProject from './components/config-project.vue'
import AppHeader from './layout/app-header.vue'

const PROJECT_CONFIG = {
	staticFile: 'index.html',
	proxy: 'http://localhost:18080'
}

const fuseOpt = {
  shouldSort: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['name', 'description', 'path']
}
export default {
  name: 'app',
  components: { ElTooltip, AppHeader, AddProject, configProject },
  data () {
    return {
      tooltipOpt: {},
      addProjectDialog: false,
      configProjectDialog: false,
      configProjectData: {},
      homeDir: '',
      projectList: [],
      queryStr: ''
    }
  },
  methods: {
    // 选择项目
    toggleDialog () {
      this.addProjectDialog = true
    },
    // 打开项目文件夹
    openProject (path) {
      this.$request({
        url: `/finder/open?path=${path}`
      })
    },
    // 打开编辑器
    openEditor (path) {
      this.$request({
        url: `/finder/open-editor?path=${path}`
      })
    },
    // 跳转到工作目录位置
    async gotoProject (data) {
      this.configProjectData = data
      this.configProjectDialog = true
      // const res = await this.$request({
      //   url: '/project/workspace',
      //   method: 'post',
      //   data: { name }
      // })
      // this.$store.commit('setWorkSpace', res)
      // this.$router.push({ name: 'project-dashboard' })
    },
    // 添加项目
    async addProject (path) {
      const list = JSON.parse(JSON.stringify(this.originProjectList))
      for (let i = 0; i < list.length; i++) {
        if (path === list[i].path) {
          return this.$message({
            message: '此静态文件已存在，请重新选择',
            type: 'warning'
          })
        }
      }
      const project = await this.$request({
        url: '/project/add',
        method: 'post',
        data: { path }
      }, { isPromptError: false })
      const { staticFile, proxy } = PROJECT_CONFIG
      Object.assign(project, { staticFile, proxy })
      list.push(project)
      setLocalData('projects', list)
      this.getProjectList()
    },
    // 删除项目
    async delProject (path) {
      // await this.$request({
      //   url: `/project?name=${name}`,
      //   method: 'delete'
      // })
      const list = JSON.parse(JSON.stringify(this.originProjectList))
      for (let i = 0; i < list.length; i++) {
        if (path === list[i].path) {
          list.splice(i, 1)
          break
        }
      }
      setLocalData('projects', list)
      this.getProjectList()
    },
    // 获取项目列表
    async getProjectList () {
      // const list = await this.$request({
      //   url: '/project/list'
      // })
      this.originProjectList = getLocalData('projects') || []
      this.initFuse()
      this.query()
    },
    // 过滤数据
    initFuse () {
      this.fuse = new Fuse(this.originProjectList, fuseOpt)
    },
    query () {
      const query = this.queryStr
      this.projectList = !query ?
        JSON.parse(JSON.stringify(this.originProjectList)):
        this.fuse.search(query).map(x => x.item)
    },
    async startServer (data) {
      const { path, proxy, staticFile } = data
      await this.$request({
        url: '/project/start',
        method: 'post',
        data: { path, proxy, staticFile }
      })
    },
    configProject (path, data) {
      const list = JSON.parse(JSON.stringify(this.originProjectList))
      for (let i = 0; i < list.length; i++) {
        if (path === list[i].path) {
          Object.assign(list[i], data)
          break
        }
      }
      setLocalData('projects', list)
      this.getProjectList()
    }
  },
  async mounted () {
    await this.$nextTick()
    this.getProjectList()
  }
}
</script>

<style scoped>
.project-manage {
  padding: 20px;
  margin: 0 20px;
  border-bottom: 1px solid #ededed;
}

.project-wapper .empty-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.project-wapper ul {
  display: flex;
  flex-direction: row;
  list-style: none;
  flex-wrap: wrap;
  padding-left: 40px;
  margin-top: 30px;
}

.project-wapper ul li.project-block {
  position: relative;
  list-style: none;
  margin-right: 20px;
  margin-bottom: 20px;
  width: 250px;
  height: 180px;
  border: 1px solid #EBEBEB;
  background: #fafafa;
  border-radius: 3px;
  padding: 20px;
  color: #444;
  box-sizing: content-box;
}

.project-wapper ul li.project-block .start-server-button {
  position: absolute;
  top: 12px;
  right: 12px;
}

.project-wapper ul li.project-block .title {
  height: 60px;
  text-align: center;
  cursor: pointer;
}

.project-wapper ul li.project-block .title .el-link--inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.project-wapper ul li.project-block .title .maintitle {
  font-size: 16px;
  line-height: 25px;
  margin-bottom: 5px;
  max-width: 100%;
}

.project-wapper ul li.project-block .title .subtitle {
  font-size: 12px;
  line-height: 20px;
  margin: 0;
  font-weight: normal;
  max-width: 100%;
  display: block;
}

.project-wapper ul li.project-block .desc {
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  color: #666;
  word-break: break-all;
  height: 80px;
}

.project-wapper ul li.project-block .operation {
  text-align: center;
}

.project-wapper ul li.project-block .el-button--small.is-circle {
  padding: 6px;
  margin: 0 10px;
}
</style>

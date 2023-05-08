<template>
  <div id="app">
    <AppHeader></AppHeader>
    <section class="project-manage">
      <el-row type="flex" justify="end">
        <el-input
          class="inline-block" style="width: 400px; margin-right: 20px;"
          placeholder="请输入搜索名称" size="small" suffix-icon="el-icon-search"
          v-model.trim="queryStr" @keyup.enter.native="query" @blur="query"></el-input>
        <el-button type="primary" icon="el-icon-plus" size='small' @click="toggleDialog">导入项目</el-button>
      </el-row>
    </section>
    <section class="project-wapper">
      <div v-if="!projectList || !projectList.length" class="empty-data center mt20">暂无数据</div>
      <ul>
        <li class="project-block" v-for="item in projectList" :key="item.name">
          <!-- 项目名称 -->
          <section class="title" @click="gotoProject(item.name)">
            <el-link
              v-idss-tooltip="{ idssOverWidthDisplay: true }"
              type="primary" class="maintitle ellipsis">
              <i class="el-icon-magic-stick" v-if="workSpacePath === item.path"></i>
              {{item.name}}
            </el-link>
            <el-link
              v-idss-tooltip="{ idssOverWidthDisplay: true }"
              type="info" :underline="false"
              class="subtitle ellipsis">{{item.description}}</el-link>
          </section>
          <!-- 项目描述 -->
          <section class="desc">
            {{item.path}}
          </section>
          <!-- 操作项 -->
          <p class="operation">
            <!-- 打开文件夹 -->
            <el-button
              v-idss-tooltip="{ content: '打开文件夹' }"
              type="primary" icon="el-icon-folder-opened"
              plain circle size="small"
              @click="openProject(item.path)"></el-button>
            <!-- 打开编辑器 -->
            <el-button
              v-idss-tooltip="{ content: '打开编辑器' }"
              type="primary" icon="el-icon-edit"
              plain circle size="small"
              @click="openEditor(item.path)"></el-button>
            <!-- 删除文件夹 -->
            <el-button
              v-if="workSpacePath !== item.path"
              v-idss-tooltip="{ content: '删除' }"
              type="primary" icon="el-icon-delete"
              plain circle size="small"
              @click="delProject(item.name)"></el-button>
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
  </div>
</template>

<script>
import AppHeader from './layout/app-header.vue'
import AddProject from './components/add-project.vue'
export default {
  name: 'app',
  components: { AppHeader, AddProject },
  data () {
    return {
      addProjectDialog: false,
      homeDir: '',
      projectList: [],
      queryStr: ''
    }
  },
  computed: {
    workSpacePath () {
      return this.$store.getters['workSpace'] && this.$store.getters['workSpace'].path
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
    async gotoProject (name) {
      const res = await this.$request({
        url: '/project/workspace',
        method: 'post',
        data: { name }
      })
      this.$store.commit('setWorkSpace', res)
      this.$router.push({ name: 'project-dashboard' })
    },
    // 添加项目
    async addProject (path) {
      await this.$request({
        url: '/project/add',
        method: 'post',
        data: { path }
      })
      this.getProjectList()
    },
    // 删除项目
    async delProject (name) {
      await this.$request({
        url: `/project?name=${name}`,
        method: 'delete'
      })
      this.getProjectList()
    },
    // 获取项目列表
    async getProjectList () {
      const list = await this.$request({
        url: '/project/list'
      })
      this.originProjectList = Object.freeze(list)
      this.initFuse()
      this.query()
    },
    // 过滤数据
    initFuse () {
      this.fuse = new Fuse(this.originProjectList, fuseOpt)
    },
    query () {
      const query = this.queryStr
      this.projectList = Object.freeze(!query ?
        this.originProjectList :
        this.fuse.search(query).map(x => x.item)
      )
    }
  },
  created () {
    this.getProjectList()
  }
}
</script>

<style scoped>
.project-manage {
  margin: 15px;
}
</style>

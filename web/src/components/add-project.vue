<template>
  <div class="idss-select-os-path">
    <!-- 头部路径 -->
    <section class="header__wapper">
      <!-- 返回上级目录 -->
      <el-button
        icon="el-icon-arrow-left" size="mini"
        @click="selectPath(pathList.slice(0, -1).join(sep))"></el-button>
      <!-- home -->
      <el-button
        icon="el-icon-s-home" size="mini"
        @click="selectPath('')"></el-button>
      <!-- 分段展示路径 -->
      <div v-if="!isShowFindPath" class="inline-block">
        <template v-for="(path, index) in pathList">
          <el-button
            :key="path"
            v-if="path"
            @click="selectPath(pathList.slice(0,index + 1).join(sep))"
            size="mini">{{path}}</el-button>
        </template>
        <el-link
          icon="el-icon-edit"
          style="margin-left: 10px;"
          v-idss-tooltip="{ content: '输入路径' }"
          @click="isShowFindPath = true"></el-link>
      </div>
      <!-- 输入框路径搜索 -->
      <el-input
        class="inline-block"
        style="width: 300px;"
        v-if="isShowFindPath"
        placeholder="请输入路径"
        size="mini"
        suffix-icon="el-icon-search"
        v-model.trim="findPath"
        @keyup.enter="selectPath(findPath, true)"
        @blur="selectPath(findPath, true)"></el-input>
    </section>
    <!-- 列表展示 -->
    <div
      v-iscroll="{fadeScrollbars: false}"
      class="scroll__warpper">
      <ul>
        <li
          v-for="item in fileList"
          :key="item.name"
          @click="selectPath(`${findPath}${sep}${item.name}`)">
          <el-link :underline="false">
            <i :class="item.type === 'dir' ? 'el-icon-folder' : 'el-icon-document'"></i>
            {{item.name}}
          </el-link>
        </li>
      </ul>
    </div>
    <!-- 尾部 -->
    <slot name="footer">
      <section class="footer__wapper">
        <el-button type="primary" size="small" @click="selectProject">确定</el-button>
        <el-button size="small" @click="close">取消</el-button>
      </section>
    </slot>
  </div>
</template>
<script>
const pathReg = /\\|\//
export default {
  props: {
    visible: Boolean
  },
  data () {
    return {
      homeDir: '',
      findPath: '',
      sep: '',
      pathList: [], // 展示的目录路径
      fileList: [],
      isShowFindPath: false // 是否输入路径
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler (isV) {
        if (isV && this.homeDir) {
          // 获取相关文件列表
          this.getFiles()
        }
      }
    }
  },
  methods: {
    async getFiles () {
      this.$emit('change', this.findPath)
      const list = await this.$request({
        url: `/finder/files?parentPath=${this.findPath}`
      })
      this.fileList = list
    },

    // 拆分路径为数组，用于展示路径
    splitPath (path) {
      return path.split(pathReg)
    },

    // 获取用户根目录
    async getHomeDir () {
      const path = await this.$request({
        url: '/finder/homedir',
        baseURL: '/api'
      })
      this.homeDir = path
      this.sep = path.match(pathReg)[0]
      this.findPath = path
      this.pathList = this.splitPath(path)
      this.getFiles()
    },

    /**
     * 选中某个路径
     * @param {string} path 需要查找的路径
     * @param {boolen} isHiddenInput 是否隐藏输入框
     */
    selectPath (path, isHiddenInput) {
      isHiddenInput && (this.isShowFindPath = false)
      this.findPath = path
      this.pathList = this.splitPath(path)
      // 获取当前选中路径下所有文件
      this.getFiles()
    },

    // 新增导入项目
    async selectProject () {
      this.$emit('select', this.findPath)
      this.close()
    },

    close () {
      this.$emit('update:visible', false)
    }
  },
  created () {
    // 获取用户根目录
    this.getHomeDir()
  }
}
</script>
<style scoped lang='postcss'>
  .idss-select-os-path {
    height: 450px;

    & .header__wapper {
      max-height: 60px;
      overflow: auto;
      >>> .el-button {
        padding: 5px 8px;
        font-size: 12px;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow:ellipsis;
        margin-bottom: 10px;

        [class^="el-icon-"]{
          font-size: 12px;
        }
      }
      .inline-block {
        display: inline-block;
        margin-left: 10px;
      }
    }
    & .footer__wapper {
      text-align: center;

      button {
        margin-right: 20px;
      }
    }

    & .scroll__warpper {
      height: 320px;
      margin-top: 20px;
      margin-bottom: 20px;
      overflow: hidden;
      
      ul {
        padding: 0 20px;

        li {
          line-height: 25px;

          .el-link {
            font-weight: normal;
          }
        }
      }
    }
  }
</style>
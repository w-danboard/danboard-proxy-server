<template>
	<div class="config-project">
		<el-form :model="form" :rules="formRules" ref="form" size="small" label-width="80px">
			<el-form-item label="项目名称" prop="name">
				<el-input v-model.trim="form.name"></el-input>
			</el-form-item>
			<el-form-item label="入口文件" prop="staticFile">
				<el-input v-model.trim="form.staticFile"></el-input>
			</el-form-item>
			<el-form-item label="远程代理" prop="proxy">
				<el-input v-model.trim="form.proxy"></el-input>
			</el-form-item>
		</el-form>
		<div class="button-wrap">
			<el-button size="small" type="primary" @click="save">提交</el-button>
			<el-button size="small" @click="close">取消</el-button>
		</div>
	</div>
</template>

<script>
import validator from 'validator'

const isHTML = (rule, value, callback) => {
	const reg = /.html$/
	if (!reg.test(value)) {
		return callback(new Error('请输入以.html结尾的文件名'))
	}
	callback()
}

const isURL = (rule, value, callback) => {
	if (!validator.isURL(value)) {
		return callback(new Error('请输入以正确的代理地址'))
	}
	callback()
}

export default {
	name: 'config-project',
	props: {
		visible: Boolean,
		data: {
			type: Object,
			default () { return {} }
		}
	},
	watch: {
		visible: {
			handler (val) {
				if (val) this.init()
			},
			immediate: true
		}
	},
	data () {
		return {
			form: {
				name: '',
				staticFile: '',
				proxy: ''
			},
			formRules: {
				name: [
					{ required: true, message: '请输入项目名称', trigger: 'blur' }
				],
				staticFile: [
					{ required: true, message: '请输入入口文件', trigger: 'blur' },
					{ validator: isHTML, trigger: 'blur' }
				],
				proxy: [
					{ required: true, message: '请输入远程代理', trigger: 'blur' }
				],
			}
		}
	},
	methods: {
		save () {
			this.$refs['form'].validate(async valid => {
				if (valid) {
					this.$emit('config', this.data.path, this.form)
					this.close()
				}
			})
		},
		close () {
			this.$emit('update:visible', false)
		},
		init () {
			const { name, staticFile, proxy } = this.data
			Object.assign(this.form, { name, staticFile, proxy })
		}
	}
}
</script>

<style scoped>
.config-project .button-wrap {
	text-align: center;
}
</style>
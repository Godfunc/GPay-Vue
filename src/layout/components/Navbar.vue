<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img v-avatar="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              主页
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/Godfunc">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a @click="showChangePassword()">
            <el-dropdown-item>修改密码</el-dropdown-item>
          </a>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">注销</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="修改密码" :visible.sync="changePasswdFormVisible">
      <el-form ref="dataForm" :rules="updateRules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="原密码" prop="password">
          <el-input v-model="temp.password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="temp.newPassword" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmNewPassword">
          <el-input v-model="temp.confirmNewPassword" placeholder="确认密码" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changePasswdFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="changePasswd()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { password } from '@/api/user'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    var validatePassword = (rule, value, callback) => {
      if (value) {
        if (!/^\S{6,20}$/.test(value)) {
          callback(new Error('密码必须是6到16位的字母、数字或者特殊字符组成'))
        } else {
          if (this.temp.confirmNewPassword !== '') {
            this.$refs.dataForm.validateField('confirmNewPassword')
          }
          callback()
        }
      } else {
        callback(new Error('新密码不能为空'))
      }
    }
    var validateConfirmPassword = (rule, value, callback) => {
      if (value) {
        if (!/^\S{6,16}$/.test(value)) {
          callback(new Error('密码必须是6到16位的字母、数字或者特殊字符组成'))
        } else if (value !== this.temp.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      } else {
        callback(new Error('新密码确认密码不能为空'))
      }
    }
    return {
      changePasswdFormVisible: false,
      temp: {
        password: undefined,
        newPassword: undefined,
        confirmNewPassword: undefined
      },
      updateRules: {
        password: [{ required: true, message: '原密码不能为空', trigger: 'blur' }],
        newPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
        confirmNewPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      this.$router.push(`/login`)
    },
    showChangePassword() {
      this.temp.password = undefined
      this.temp.newPassword = undefined
      this.temp.confirmNewPassword = undefined
      this.changePasswdFormVisible = true
    },
    changePasswd() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          password(this.temp).then(response => {
            if (response.code === 0) {
              this.changePasswdFormVisible = false
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

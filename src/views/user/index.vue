<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" v-permission="'mg:user:page'" clearable placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'mg:user:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-button v-waves v-permission="'mg:user:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'mg:user:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
    >
      <el-table-column align="center" label="#" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | genderFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center">
        <template slot-scope="scope">
          {{ scope.row.mobile }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120" align="center">
        <template slot-scope="scope">
          {{ scope.row.superManager | superManagerFilter }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center">
        <template slot-scope="scope">
          {{ scope.row.createUser }}
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateUser }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="110" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'mg:user:edit'" type="text" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'mg:user:remove'" type="text" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="dialogStatus==='create'?createRules: updateRules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="手机号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="temp.confirmPassword" placeholder="确认密码" show-password />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="temp.gender">
            <el-radio-button :label="1">男</el-radio-button>
            <el-radio-button :label="2">女</el-radio-button>
            <el-radio-button :label="3">未知</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="temp.roles" multiple placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, add, edit, remove } from '@/api/user'
import { list, getByUser } from '@/api/role'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '启用',
        0: '停用'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    genderFilter(gender) {
      const genderMap = {
        1: '男',
        2: '女',
        3: '未知'
      }
      return genderMap[gender]
    },
    superManagerFilter(type) {
      const typeMap = {
        1: '超级管理员',
        0: '普通账号'
      }
      return typeMap[type]
    }
  },
  data() {
    var validatePassword = (rule, value, callback) => {
      if (value) {
        if (!/^\S{6,20}$/.test(value)) {
          callback(new Error('密码必须是6到16位的字母、数字或者特殊字符组成'))
        } else {
          if (this.temp.confirmPassword !== '') {
            this.$refs.dataForm.validateField('confirmPassword')
          }
          callback()
        }
      } else {
        callback()
      }
    }
    var validateConfirmPassword = (rule, value, callback) => {
      if (value) {
        if (!/^\S{6,16}$/.test(value)) {
          callback(new Error('密码必须是6到16位的字母、数字或者特殊字符组成'))
        } else if (value !== this.temp.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      roleList: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        status: undefined,
        username: undefined
      },
      temp: {
        id: undefined,
        username: undefined,
        gender: undefined,
        mobile: undefined,
        status: undefined,
        password: undefined,
        confirmPassword: undefined,
        roles: undefined
      },
      createRules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '用户状态不能位空', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }],
        confirmPassword: [{ required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }]
      },
      updateRules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '用户状态不能位空', trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
    this.getRoleData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status, this.listQuery.username ? this.listQuery.username : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getRoleData() {
      list().then(response => {
        this.roleList = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: undefined,
        gender: 1,
        mobile: undefined,
        status: 1,
        password: undefined,
        confirmPassword: undefined,
        roles: undefined
      }
    },
    setUserRoles(userId) {
      getByUser(userId).then(response => {
        if (response.data) {
          this.temp.roles = response.data
        }
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    setUpdateTemp(row) {
      this.temp.id = row.id
      this.temp.username = row.username
      this.temp.gender = row.gender
      this.temp.mobile = row.mobile
      this.temp.status = row.status
      this.temp.password = undefined
      this.temp.confirmPassword = undefined
      this.temp.roles = undefined
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.setUserRoles(this.temp.id)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          add(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.fetchData()
              this.$message({
                type: 'success',
                message: '新增成功!'
              })
            }
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          edit(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.fetchData()
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
            }
          })
        }
      })
    },
    deleteData(id) {
      this.$confirm('确定删除该用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        remove(id).then(response => {
          if (response.code === 0) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
      })
    }
  }
}
</script>

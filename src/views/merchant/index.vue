<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:merchant:page'" clearable placeholder="商户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" v-permission="'merchant:merchant:page'" clearable placeholder="商户号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:merchant:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-select v-model="listQuery.type" v-permission="'merchant:merchant:page'" placeholder="类型" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="商户" value="1" />
        <el-option key="2" label="代理" value="2" />
      </el-select>
      <el-button v-waves v-permission="'merchant:merchant:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:merchant:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="商户名" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
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
      <el-table-column label="操作" align="center" width="131" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:merchant:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:merchantRisk:list'" type="text" style="color: #e6a23c;" @click="handleRisk(scope.row.code)">风控</el-button>
          <el-button v-permission="'merchant:merchantChannelRate:list'" type="text" style="color: #409eff;" @click="handleChannelRate(scope.row.code)">费率</el-button>
          <el-button v-permission="'merchant:merchant:keys'" type="text" style="color: #409eff;" @click="handleKeys(scope.row)">密钥</el-button>
          <el-button v-permission="'merchant:merchant:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item v-show="dialogStatus == 'create'" label="用户" prop="userId">
          <el-select v-model="temp.userId" no-data-text="请先去【用户管理】创建用户" style="width: 100%" :disabled="dialogStatus == 'update'" placeholder="用户">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="dialogStatus == 'update'" label="用户" prop="username">
          <el-input v-model="temp.username" placeholder="用户" :disabled="dialogStatus == 'update'" />
        </el-form-item>
        <el-form-item label="代理" prop="agentId">
          <el-select v-model="temp.agentId" style="width: 100%" :disabled="dialogStatus == 'update'" placeholder="请选择代理商户">
            <el-option
              v-for="item in agentList"
              :key="item.id"
              :label="item.name + '【' + item.code + '】'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名" prop="name">
          <el-input v-model="temp.name" placeholder="商户名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="temp.type" :disabled="dialogStatus == 'update'">
            <el-radio-button :label="1">商户</el-radio-button>
            <el-radio-button :label="2">代理</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="temp.type == 1" label="商户公钥" prop="publicKey">
          <el-input v-model="temp.publicKey" type="textarea" :rows="4" placeholder="商户公钥" />
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
    <keys ref="keys" />
    <merchant-risk ref="merchantRisk" />
    <channel-rate ref="channelRate" />
  </div>
</template>

<script>
import { page, list, add, edit, remove } from '@/api/merchant'
import { list as getUserList } from '@/api/user'
import Pagination from '@/components/Pagination'
import merchantRisk from './merchantRisk'
import keys from './keys'
import channelRate from './channelRate'

export default {
  components: {
    Pagination,
    'keys': keys,
    'merchant-risk': merchantRisk,
    'channel-rate': channelRate
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '启用',
        0: '停用'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      const typeMap = {
        1: '商户',
        2: '代理'
      }
      return typeMap[type]
    },
    statusTypeFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      merchantCode: undefined,
      userList: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      agentList: undefined,
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        type: undefined,
        status: undefined,
        name: undefined,
        code: undefined
      },
      temp: {
        id: undefined,
        agentId: undefined,
        userId: undefined,
        name: undefined,
        publicKey: undefined,
        status: undefined,
        type: undefined,
        username: undefined
      },
      rules: {
        userId: [{ required: true, message: '请选择关联的用户', trigger: 'blur' }],
        name: [{ required: true, message: '商户名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '商户类型不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.type, this.listQuery.status, this.listQuery.name ? this.listQuery.name : undefined, this.listQuery.code ? this.listQuery.code : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
      this.getRoleData()
      this.getAgentList()
    },
    handleKeys(row) {
      this.$refs.keys.handleKeys(row)
    },
    handleRisk(merchantCode) {
      this.$refs.merchantRisk.handleRisk(merchantCode)
    },
    handleChannelRate(merchantCode) {
      this.$refs.channelRate.handleList(merchantCode)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    getRoleData() {
      getUserList().then(response => {
        this.userList = response.data
      })
    },
    getAgentList() {
      list(2).then(response => {
        this.agentList = response.data
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        agentId: undefined,
        userId: undefined,
        name: undefined,
        publicKey: undefined,
        username: undefined,
        status: 1,
        type: 1
      }
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
      this.temp.agentId = row.agentId
      this.temp.userId = row.userId
      this.temp.name = row.name
      this.temp.publicKey = row.publicKey
      this.temp.status = row.status
      this.temp.type = row.type
      this.temp.username = row.username
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.temp.username = undefined
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
      this.temp.username = undefined
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
      this.$confirm('确定删除该商户吗（商户关联的账号也会被删除）?', '警告', {
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

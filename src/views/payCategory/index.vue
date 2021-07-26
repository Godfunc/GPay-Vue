<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:payCategory:page'" clearable placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" v-permission="'merchant:payCategory:page'" clearable placeholder="编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:payCategory:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-button v-waves v-permission="'merchant:payCategory:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:payCategory:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.code }}
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
      <el-table-column label="操作" align="center" width="110" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:payCategory:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:payCategoryChannel:list'" type="text" style="color: #67c23a;" @click="handleWeight(scope.row)">权重</el-button>
          <el-button v-permission="'merchant:payCategory:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="商户名" />
        </el-form-item>
        <el-form-item label="编号" prop="code">
          <el-input v-model="temp.code" placeholder="编号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
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
    <channel-weight ref="channelWeight" />
  </div>
</template>

<script>
import { page, add, edit, remove } from '@/api/payCategory'
import Pagination from '@/components/Pagination'
import channelWeight from './channelWeight'

export default {
  components: {
    Pagination,
    'channel-weight': channelWeight
  },
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
    }
  },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        status: undefined,
        name: undefined,
        code: undefined
      },
      temp: {
        id: undefined,
        name: undefined,
        status: undefined,
        code: undefined
      },
      rules: {
        name: [{ required: true, message: '商户名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '编号不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status, this.listQuery.name ? this.listQuery.name : undefined, this.listQuery.code ? this.listQuery.code : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: undefined,
        status: 1,
        code: undefined
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
      this.temp.name = row.name
      this.temp.status = row.status
      this.temp.code = row.code
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleWeight(row) {
      this.$refs.channelWeight.handleList(row.categoryId)
    },
    createData() {
      console.log(this.temp)
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
      this.$confirm('确定删除该渠道主类吗?该渠道关联的商户费率等数据也将被删除', '警告', {
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

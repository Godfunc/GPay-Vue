<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.merchantCode" v-permission="'merchant:merchantChannelRate:page'" clearable placeholder="商户号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.categoryCode" v-permission="'merchant:merchantChannelRate:page'" clearable placeholder="渠道主类编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.channelCode" v-permission="'merchant:merchantChannelRate:page'" clearable placeholder="渠道子类编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves v-permission="'merchant:merchantChannelRate:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:merchantChannelRate:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
          {{ scope.row.merchantName }}
        </template>
      </el-table-column>
      <el-table-column label="商户号" align="center">
        <template slot-scope="scope">
          {{ scope.row.merchantCode }}
        </template>
      </el-table-column>
      <el-table-column label="渠道主类编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.payCategoryCode }}
        </template>
      </el-table-column>
      <el-table-column label="渠道主类名" align="center">
        <template slot-scope="scope">
          {{ scope.row.payCategoryName }}
        </template>
      </el-table-column>
      <el-table-column label="渠道子类编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.payChannelCode }}
        </template>
      </el-table-column>

      <el-table-column label="渠道子类名" align="center">
        <template slot-scope="scope">
          {{ scope.row.payChannelName }}
        </template>
      </el-table-column>
      <el-table-column label="费率" align="center">
        <template slot-scope="scope">
          {{ scope.row.rate }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="110" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:merchantChannelRate:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:merchantChannelRate:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="商户号" prop="merchantCode">
          <el-input v-model="temp.merchantCode" placeholder="商户号" />
        </el-form-item>
        <el-form-item label="渠道关联" prop="categoryChannelId">
          <el-select v-model="temp.categoryChannelId" style="width:100%" placeholder="请选择渠道关联">
            <el-option
              v-for="item in categoryChannelList"
              :key="item.id"
              :label="'主类【' + item.payCategoryName + '(' + item.payCategoryCode +')】' + '  子类【' +item.payChannelName + '('+item.payChannelCode +')】'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费率" prop="rate">
          <el-input v-model="temp.rate" placeholder="费率" />
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
import { page, add, edit, remove } from '@/api/merchantChannelRate'
import { list as getCategoryChannelList } from '@/api/payCategoryChannel'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      categoryChannelList: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        merchantCode: undefined,
        payCategoryCode: undefined,
        payChannelCode: undefined
      },
      temp: {
        id: undefined,
        merchantCode: undefined,
        categoryChannelId: undefined,
        rate: undefined
      },
      rules: {
        merchantCode: [{ required: true, message: '商户号不能为空', trigger: 'blur' }],
        categoryChannelId: [{ required: true, message: '渠道关联不能为空', trigger: 'blur' }],
        rate: [{ required: true, message: '费率不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.merchantCode ? this.listQuery.merchantCode : undefined, this.listQuery.channelCode ? this.listQuery.channelCode : undefined, this.listQuery.categoryCode ? this.listQuery.categoryCode : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
      this.getChannel()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    getChannel() {
      getCategoryChannelList().then(response => {
        this.categoryChannelList = response.data
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        merchantCode: undefined,
        categoryChannelId: undefined,
        rate: undefined
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
      this.temp.merchantCode = row.merchantCode
      this.temp.categoryChannelId = row.categoryChannelId
      this.temp.rate = row.rate
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
      this.$confirm('确定删除该渠道主类吗?', '警告', {
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

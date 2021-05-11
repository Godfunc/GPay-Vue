<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'mg:role:page'" clearable placeholder="角色名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves v-permission="'mg:role:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'mg:role:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="角色名" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
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
      <el-table-column label="备注" align="center">
        <template slot-scope="scope">
          {{ scope.row.remark }}
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
      <el-table-column label="操作" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'mg:role:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'mg:role:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="temp.name" placeholder="角色名" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" placeholder="备注" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTree"
            :data="menuList"
            show-checkbox
            node-key="id"
            accordion
            :props="{ children: 'children', label: 'name' }"
          />
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
import { getTree } from '@/api/menu'
import { page, edit, add, remove, getMenus } from '@/api/role'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
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
        name: undefined
      },
      menuList: undefined,
      temp: {
        id: undefined,
        name: undefined,
        remark: undefined,
        menus: undefined
      },
      rules: {
        name: [{ required: true, message: '角色名不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.name ? this.listQuery.name : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getMenuTree() {
      getTree().then(response => {
        this.menuList = response.data
        if (this.dialogStatus === 'update') {
          getMenus(this.temp.id).then(response => {
            if (response.data) {
              response.data.forEach(item => this.$refs.menuTree.setChecked(item, true))
            }
          })
        } else {
          this.$refs.menuTree.setCheckedKeys([])
        }
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
        remark: undefined,
        menus: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.getMenuTree()
      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    setUpdateTemp(row) {
      this.temp.id = row.id
      this.temp.name = row.name
      this.temp.remark = row.remark
      this.temp.menus = undefined
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.getMenuTree()
      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.menus = [...this.$refs.menuTree.getCheckedKeys(), ...this.$refs.menuTree.getHalfCheckedKeys()]
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
          this.temp.menus = [...this.$refs.menuTree.getHalfCheckedKeys(), ...this.$refs.menuTree.getCheckedKeys()]
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

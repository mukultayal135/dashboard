import React, { useEffect, useState } from 'react'
import { Drawer, Progressing, showError } from '../common'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { getNodeTaints, updateTaints } from './clusterNodes.service'
import ReactSelect from 'react-select'
import { OptionType } from '../app/types'
import { Option, DropdownIndicator } from '../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import { TaintErrorObj } from './types'
import { ValidationRules } from './validationRules'
import { TAINT_OPTIONS } from './constants'
import { toast } from 'react-toastify'

interface EditTaintsModalType {
    clusterId: string
    nodeName: string
    closeTaintsModal: () => void
}

export default function EditTaintsModal({ clusterId, nodeName, closeTaintsModal }: EditTaintsModalType) {
    const [loader, setLoader] = useState(false)
    const [taintList, setTaintList] = useState<{ key: string; value: string; taintOption: string }[]>([])
    const [errorObj, setErrorObj] = useState<TaintErrorObj>({ isValid: true, taintErrorList: [] })
    const validationRules = new ValidationRules()

    const getData = () => {
        setLoader(true)
        getNodeTaints(clusterId, nodeName)
            .then((response) => {
                if (response.result) {
                    setTaintList(response.result)
                    const _errorObj = { isValid: true, taintErrorList: [] }
                    response.result.forEach((element) => {
                        _errorObj.taintErrorList.push({
                            key: validationRules.taintKey(element.key),
                            value: validationRules.taintValue(element.value),
                        })
                    })
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    useEffect(() => {
        getData()
    }, [])

    const deleteTaint = (e): void => {
        const index = e.currentTarget.dataset.index
        const _taintList = [...taintList]
        _taintList.splice(index, 1)
        setTaintList(_taintList)
        const _errorObj = { ...errorObj }
        _errorObj.taintErrorList.splice(index, 1)
        setErrorObj(_errorObj)
    }

    const addNewTaint = (): void => {
        const _taintList = [...taintList, { key: '', value: '', taintOption: 'Prevent Scheduling' }]
        setTaintList(_taintList)

        const _errorObj = { ...errorObj }
        _errorObj.taintErrorList.push({
            key: { isValid: true, message: null },
            value: { isValid: true, message: null },
        })
        setErrorObj(_errorObj)
    }

    const handleInputChange = (e): void => {
        const _taintList = [...taintList]
        const index = e.currentTarget.dataset.index
        _taintList[index][e.target.name] = e.target.value
        setTaintList(_taintList)
        const _errorObj = { ...errorObj }
        if (e.target.name === 'key') {
            _errorObj.taintErrorList[index][e.target.name] = validationRules.taintKey(e.target.value)
        } else {
            _errorObj.taintErrorList[index][e.target.name] = validationRules.taintValue(e.target.value)
        }

        setErrorObj(_errorObj)
    }

    const onTaintOptionChange = (selectedValue: OptionType, index: number): void => {
        const _taintList = [...taintList]
        _taintList[index].taintOption = selectedValue.label
        setTaintList(_taintList)
    }

    const validateTaintList = (): TaintErrorObj => {
        const _taintList = [...taintList]
        const _errorObj = { isValid: true, taintErrorList: []}
        for (let index = 0; index < _taintList.length; index++) {
            const element = _taintList[index]
            const validateTaintKey = validationRules.taintKey(element.key)
            const validateTaintValue = validationRules.taintValue(element.value)
            _errorObj.taintErrorList.push({
                key: validateTaintKey,
                value: validateTaintValue,
            })
            _errorObj.isValid = _errorObj.isValid && validateTaintKey.isValid && validateTaintValue.isValid
        }
        setErrorObj(_errorObj)
        return _errorObj
    }

    const onSave = () => {
        if (!validateTaintList().isValid) {
            return
        }

        setLoader(true)
        updateTaints(clusterId, nodeName, taintList)
            .then((response) => {
                if (response.result) {
                    toast.success('Successfully saved')
                }
                setLoader(false)
                closeTaintsModal()
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bcn-0 h-100">
                <div className="flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Edit taints for node ‘{nodeName}’</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={closeTaintsModal}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="pt-16 pr-20 pb-16 pl-20" style={{ height: 'calc(100vh - 125px)' }}>
                    <InfoColourBar
                        message="Add taints to nodes so that pods are not scheduled to the nodes or not scheduled to the nodes if possible. After you add taints to nodes, you can set tolerations on a pod to allow the pod to be scheduled to nodes with certain taints."
                        classname="info_bar mb-16"
                        Icon={InfoIcon}
                        iconClass="icon-dim-20"
                    />
                    <div
                        className="task-item add-task-container cb-5 fw-6 fs-13 flexbox mr-20 mb-12"
                        onClick={addNewTaint}
                    >
                        <Add className="icon-dim-20 fcb-5" /> Add taint
                    </div>
                    {taintList?.map((taintDetails, index) => {
                        const _errorObj = errorObj.taintErrorList[index]
                        return (
                            <div className="flexbox mb-8">
                                <div className="w-100 mr-8">
                                    <input
                                        type="text"
                                        name="key"
                                        data-index={index}
                                        value={taintDetails.key}
                                        className="form__input h-32"
                                        onChange={handleInputChange}
                                    />
                                    {_errorObj && !_errorObj['key'].isValid && (
                                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{_errorObj['key'].message}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="w-100 mr-8">
                                    <input
                                        type="text"
                                        name="value"
                                        data-index={index}
                                        value={taintDetails.value}
                                        className="form__input h-32"
                                        onChange={handleInputChange}
                                    />
                                    {_errorObj && !_errorObj['value'].isValid && (
                                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{_errorObj['value'].message}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="w-70 mr-8">
                                    <ReactSelect
                                        options={TAINT_OPTIONS}
                                        onChange={(selectedValue) => {
                                            onTaintOptionChange(selectedValue, index)
                                        }}
                                        data-index={index}
                                        components={{
                                            IndicatorSeparator: null,
                                            DropdownIndicator,
                                            Option: (props) => (
                                                <Option
                                                    {...props}
                                                    tippyClass="default-tt w-200"
                                                    showTippy={true}
                                                    placement="left"
                                                    tippyContent={props.data['description']}
                                                />
                                            ),
                                        }}
                                        value={{
                                            label: taintDetails.taintOption,
                                            value: taintDetails.taintOption,
                                        }}
                                        styles={{
                                            ...containerImageSelectStyles,
                                            singleValue: (base, state) => ({
                                                ...base,
                                                padding: '5px 0',
                                            }),
                                        }}
                                    />
                                </div>
                                <div>
                                    <Delete
                                        className="icon-dim-20 scn-6 mt-4 pointer"
                                        data-index={index}
                                        onClick={deleteTaint}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="dc__border-top flex right p-16">
                    <button className="cta cancel h-36 lh-36 mr-12" type="button" onClick={closeTaintsModal}>
                        Cancel
                    </button>
                    <button className="cta h-36 lh-36" onClick={onSave}>
                        {loader ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>
        </Drawer>
    )
}

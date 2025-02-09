import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import SavedVariablesView from '../SavedVariables'
import { validScopedVariablesData } from '../mocks'
import { downloadData } from '../utils'
import { ScopedVariablesDataType } from '../types'
import { useClickOutside } from '../../common'

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => <div></div>))
jest.mock('../utils', () => ({
    downloadData: jest.fn(),
    parseIntoYAMLString: jest.fn(() => 'YAML'),
}))

jest.mock('../../common', () => ({
    importComponentFromFELibrary: jest.fn(),
    useClickOutside: jest.fn(),
    useFileReader: jest.fn().mockResolvedValue({
        readFile: jest.fn(),
        fileData: 'fileData',
        progress: 100,
        abortRead: jest.fn(),
        status: {
            status: true,
            message: 'SUCCESS',
        },
    }),
    Grid: jest.fn(() => <div></div>),
    HiddenInput: jest.fn(() => <input type="file" />),
}))

describe('SavedVariables', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render YAML view by default', () => {
        const { container } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataType}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('YAML')
    })

    it('should render Variable List view when Variable List tab is clicked', () => {
        const { container } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataType}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const variableListTab = container.querySelector('.scoped-variables-tab:nth-child(2)')
        fireEvent.click(variableListTab as Element)
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('Variable List')
        const yamlTab = container.querySelector('.scoped-variables-tab:nth-child(1)')
        fireEvent.click(yamlTab as Element)
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('YAML')
    })

    // data-testid is not able to be fetched for dropdown it will work on React 18
    xit('should download saved file when download saved file button is clicked from dropdown', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataType}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        const downloadButton = container.querySelector('.scoped-variables-editor-infobar__dropdown-item:nth-child(1)')
        expect(downloadButton?.innerHTML).toBe('Download saved file')
        expect(downloadData).not.toHaveBeenCalled()
        fireEvent.click(downloadButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeFalsy()
    })

    xit('should download template file when download template file button is clicked from dropdown', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataType}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        const downloadButton = container.querySelector('.scoped-variables-editor-infobar__dropdown-item:nth-child(2)')
        expect(downloadButton?.innerHTML).toBe('Download template')
        expect(downloadData).not.toHaveBeenCalled()
        fireEvent.click(downloadButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeFalsy()
    })

    xit('should close dropdown when dropdown is open and somewhere outside is clicked', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataType}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        fireEvent.click(container.querySelector('input') as Element)
        expect(useClickOutside).toHaveBeenCalled()
    })
})

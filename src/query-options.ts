// Thanks to https://github.com/hso-nn/d365-cli/blob/1fab244929112ebb685953ce5f266f4e1a8d992d/bin/root/src/WebApi/SystemQueryOptions.ts

import { EmptyString } from "./utils/common";

export type RetrieveMultipleOptions = MultipleQueryOptions | string;

export function convertRetrieveMultipleOptionsToString(options: RetrieveMultipleOptions | undefined) {
    switch (typeof options) {
        case "string": 
            if (!options.startsWith("?")) {
                throw new Error("Query option must start with ?");
            }
            return options;
        case "object":
            return convertQueryOptionsToString(options);
        case "undefined":
            return EmptyString;
        default:
            throw new Error("Invalid retrieve multiple options");
    }
}

export type RetrieveOptions = QueryOptions | string;

export function convertRetrieveOptionsToString(options: RetrieveOptions | undefined) {
    return convertRetrieveMultipleOptionsToString(options);
}

// ---

export interface Expand {
    attribute: string;
    select: string[];
}

export interface QueryOptions {
    select: string[];
    expands?: Expand[];
}

export type Order = "asc" | "desc";
export interface OrderBy {
    attribute: string;
    order?: Order;
}

export type QueryFunction = "Above" | "AboveOrEqual" | "Between" | "Contains" | "ContainValues" | "DoesNotContainValues" | "EqualBusinessId" | "EqualUserId" |
    "EqualUserLanguage" | "EqualUserOrUserHierarchy" | "EqualUserOrHierarchyAndTeams" | "EqualUserOrUserTeams" | "EqualUserTeams" | "In" | "InFiscalPeriod" |
    "InFiscalPeriodAndYear" | "InFiscalYear" | "InOrAfterFiscalPeriodAndYear" | "InOrBeforeFiscalPeriodAndYear" | "Last7Days" | "LastFiscalPeriod" | "LastFiscalYear" |
    "LastMonth" | "LastWeek" | "LastXDays" | "LastXFiscalPeriods" | "LastXFiscalYears" | "LastXHours" | "LastXMonths" | "LastXWeeks" | "LastXYears" | "LastYear" |
    "Next7Days" | "NextFiscalPeriod" | "NextFiscalYear" | "NextMonth" | "NextWeek" | "NextXDays" | "NextXFiscalPeriods" | "NextXFiscalYears" | "NextXHours" |
    "NextXMonths" | "NextXWeeks" | "NextXYears" | "NextYear" | "NotBetween" | "NotEqualBusinessId" | "NotEqualUserId" | "NotIn" | "NotUnder" | "OlderThanXDays" |
    "OlderThanXHours" | "OlderThanXMinutes" | "OlderThanXMonths" | "OlderThanXWeeks" | "OlderThanXYears" | "On" | "OnOrAfter" | "OnOrBefore" | "ThisFiscalPerios" |
    "ThisFiscalYear" | "ThisMonth" | "ThisWeek" | "ThisYear" | "Today" | "Tomorrow" | "Under" | "UnderOrEqual" | "Yesterday";

    
const filterCondition = ["eq", "ne", "gt", "ge", "lt", "le"] as const;
export type FilterCondition = typeof filterCondition[number];

export interface Condition {
    attribute: string;
    operator?: FilterCondition | QueryFunction;
    value?: any;
}

export type FilterType = "and" | "or" | "not";

export interface Filter {
    type?: FilterType;
    conditions: Condition[];
    filters?: Filter[];
}

export interface MultipleQueryOptions extends QueryOptions {
    filters?: Filter[];
    orders?: OrderBy[];
    top?: number;
}

export function convertQueryOptionsToString(options: MultipleQueryOptions): string {
    const {select, filters, top, expands } = options,
        $select = generateSelect(select),
        $filter = generateFilter(filters),
        $expand = generateExpand(expands),
        $top = top ? `$top=${top}` : null,
        optionParts = [];

    if ($select) {
        optionParts.push($select);
    }
    if ($filter) {
        optionParts.push($filter);
    }
    if ($top) {
        optionParts.push($top);
    }
    if ($expand) {
        optionParts.push($expand)
    }
    
    return optionParts.length > 0 ? `?${optionParts.join("&")}` : EmptyString;
}

function generateExpand(expands: Expand[]= []): string {
    const expandsText = expands.map(e => `${e.attribute}(${generateSelect(e.select)})`);
    return expandsText.length > 0 ? `$expand=${expandsText.join(",")}` : EmptyString;
}

function generateSelect(attributes: string[] = []): string {
    return attributes.length > 0 ? `$select=${attributes.join(",")}` : EmptyString;
}

function generateFilter(filters: Filter[] = []): string {
    const filterAttributes = filters.map(f => parseFilter(f));
    return filterAttributes.length > 0 ? `$filter=${filterAttributes.join(" and ")}` : EmptyString;
}

function parseQueryFunction(condition: Condition): string {
    const { attribute, operator = 'eq', value } = condition;

    let propertyValueStr = EmptyString;

    if (value !== undefined) {
        if (Array.isArray(value)) {
            const values = value.map(val => `'${val}'`);
            propertyValueStr = `,PropertyValues=[${values.join(',')}]`;
        } else {
            propertyValueStr = `,PropertyValue='${value}'`;
        }
    }
    
    return `Microsoft.Dynamics.CRM.${operator}(PropertyName='${attribute}'${propertyValueStr})`;
}

function parseFilterCondition(condition: Condition) {
    const { attribute, operator, value } = condition;
    const valueStr = typeof(value) === "string" ? `'${value}'` : `${value}`;
    return `${attribute} ${operator} ${valueStr}`;
}

function parseFilter(filter: Filter): string {
    const { type = "and", conditions } = filter;
    const filterParts: string[] = [];

    for (const condition of conditions) {
        const { operator = "eq" } = condition;
        if (filterCondition.includes(operator as FilterCondition)) {
            filterParts.push(parseFilterCondition(condition));
        }
        else {
            filterParts.push(parseQueryFunction(condition));
        }
    }

    return `(${filterParts.join(` ${type} `)})`;
}